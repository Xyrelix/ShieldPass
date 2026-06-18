export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
      <p>
        ShieldPass — ZK compliance on{' '}
        <a
          href="https://stellar.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700"
        >
          Stellar
        </a>
        . Your identity never touches the blockchain.
      </p>
    </footer>
  );
}
