#![cfg(test)]

use super::*;
use soroban_sdk::testutils::{Address as _, Ledger};
use soroban_sdk::token::{StellarAssetClient, TokenClient};
use soroban_sdk::{Address, BytesN, Env};

fn setup_token<'a>(env: &Env, admin: &Address) -> (Address, TokenClient<'a>, StellarAssetClient<'a>) {
    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    let addr = sac.address();
    (addr.clone(), TokenClient::new(env, &addr), StellarAssetClient::new(env, &addr))
}

#[test]
fn test_lock_records_swap() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_addr, _token, token_admin_client) = setup_token(&env, &token_admin);
    token_admin_client.mint(&user, &1_000);

    let id = env.register(TrustlessSwap, ());
    let swap = TrustlessSwapClient::new(&env, &id);
    swap.init(&admin);

    let nullifier = BytesN::from_array(&env, &[1u8; 32]);
    let swap_id = swap.lock_swap(&user, &token_addr, &100, &nullifier);
    assert_eq!(swap_id, 1);

    let record = swap.get_swap(&swap_id);
    assert_eq!(record.user, user);
    assert_eq!(record.amount, 100);
    assert!(record.status == SwapStatus::Locked);
}

#[test]
fn test_lock_then_admin_claims_to_treasury() {
    let env = Env::default();
    env.mock_all_auths();

    // Admin doubles as the treasury — claim_swap sweeps the crypto to the admin address.
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_addr, token, token_admin_client) = setup_token(&env, &token_admin);
    token_admin_client.mint(&user, &1_000);

    let id = env.register(TrustlessSwap, ());
    let swap = TrustlessSwapClient::new(&env, &id);
    swap.init(&admin);

    let nullifier = BytesN::from_array(&env, &[7u8; 32]);
    let swap_id = swap.lock_swap(&user, &token_addr, &600, &nullifier);

    // Crypto is now locked in the contract, not with the user.
    assert_eq!(token.balance(&user), 400);
    assert_eq!(token.balance(&id), 600);

    // Admin claims after fiat payout -> crypto swept to the treasury (admin).
    swap.claim_swap(&swap_id);
    assert_eq!(token.balance(&admin), 600);
    assert_eq!(token.balance(&id), 0);
    assert!(swap.get_swap(&swap_id).status == SwapStatus::Completed);
}

#[test]
#[should_panic]
fn test_user_cannot_claim() {
    let env = Env::default();

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_addr, _token, token_admin_client) = setup_token(&env, &token_admin);
    token_admin_client.mint(&user, &1_000);

    let id = env.register(TrustlessSwap, ());
    let swap = TrustlessSwapClient::new(&env, &id);

    env.mock_all_auths();
    swap.init(&admin);
    let nullifier = BytesN::from_array(&env, &[7u8; 32]);
    let swap_id = swap.lock_swap(&user, &token_addr, &600, &nullifier);

    // Drop all authorizations: the admin has not authorized, so claim must panic.
    env.set_auths(&[]);
    swap.claim_swap(&swap_id);
}

#[test]
fn test_refund_after_timeout() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_addr, token, token_admin_client) = setup_token(&env, &token_admin);
    token_admin_client.mint(&user, &1_000);

    let id = env.register(TrustlessSwap, ());
    let swap = TrustlessSwapClient::new(&env, &id);
    swap.init(&admin);

    let nullifier = BytesN::from_array(&env, &[7u8; 32]);
    let swap_id = swap.lock_swap(&user, &token_addr, &600, &nullifier);
    assert_eq!(token.balance(&id), 600);

    // Fast-forward past the 1-hour (3600s) time-lock.
    env.ledger().with_mut(|l| l.timestamp += 3601);

    swap.refund_swap(&swap_id);
    assert_eq!(token.balance(&user), 1_000);
    assert_eq!(token.balance(&id), 0);
    assert!(swap.get_swap(&swap_id).status == SwapStatus::Refunded);
}

#[test]
#[should_panic]
fn test_refund_before_timeout_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_addr, _token, token_admin_client) = setup_token(&env, &token_admin);
    token_admin_client.mint(&user, &1_000);

    let id = env.register(TrustlessSwap, ());
    let swap = TrustlessSwapClient::new(&env, &id);
    swap.init(&admin);

    let nullifier = BytesN::from_array(&env, &[7u8; 32]);
    let swap_id = swap.lock_swap(&user, &token_addr, &600, &nullifier);

    // No time has elapsed — refund must panic on the time-lock check.
    swap.refund_swap(&swap_id);
}
