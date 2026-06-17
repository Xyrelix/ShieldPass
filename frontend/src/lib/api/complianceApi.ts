import { apiClient } from './apiClient';
import type {
  AttestationResponse,
  ComplianceRootResponse,
  ProofSubmitPayload,
  ProofSubmitResponse,
} from '../../types/api.types';

export async function issueAttestation(): Promise<AttestationResponse> {
  const { data } = await apiClient.post<AttestationResponse>('/compliance/issue-attestation');
  return data;
}

export async function getComplianceRoot(): Promise<ComplianceRootResponse> {
  const { data } = await apiClient.get<ComplianceRootResponse>('/compliance/root');
  return data;
}

export async function submitProof(payload: ProofSubmitPayload): Promise<ProofSubmitResponse> {
  const { data } = await apiClient.post<ProofSubmitResponse>('/verify/submit-proof', payload);
  return data;
}
