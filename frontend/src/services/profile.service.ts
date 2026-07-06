export interface UserProfile {
  user_id: string;
  username: string;
  pno_number: string;
  full_name: string;
  father_name: string;
  dob: string;
  gender: string;
  rank: string;
  designation?: string;
  grade?: string;
  posting_district: string;
  email: string;
  mobile_number: string;
  address?: string;
  aadhaar_number?: string;
  emergency_contact?: string;
  profile_photo_url?: string;
  batch_year?: number;
  employee_category?: string;
  current_posting_date?: string;
  district_id?: string;
  home_district_id?: string;
  joining_date?: string;
}

export interface UserDocument {
  document_id: string;
  user_id: string;
  document_type: 'AADHAAR' | 'SERVICE_CERTIFICATE' | 'MEDICAL_CERTIFICATE' | 'SPOUSE_POSTING' | 'DISABILITY' | 'OTHER';
  file_name: string;
  file_path: string;
  is_verified: boolean;
  uploaded_at: string;
}

const API_URL = 'http://localhost:5000/api/v1/profile';

export const getProfile = async (token: string): Promise<UserProfile> => {
  const res = await fetch(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.data;
};

export const updateProfile = async (token: string, data: Partial<UserProfile>): Promise<UserProfile> => {
  const res = await fetch(`${API_URL}/me`, {
    method: 'PUT',
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return result.data;
};

export const uploadProfilePhoto = async (token: string, file: File): Promise<UserProfile> => {
  const formData = new FormData();
  formData.append('photo', file);
  const res = await fetch(`${API_URL}/photo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.data;
};

export const getDocuments = async (token: string): Promise<UserDocument[]> => {
  const res = await fetch(`${API_URL}/documents`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.data;
};

export const uploadDocument = async (token: string, type: string, file: File): Promise<UserDocument[]> => {
  const formData = new FormData();
  formData.append('document_type', type);
  formData.append('document', file);
  const res = await fetch(`${API_URL}/documents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.data;
};

export const deleteDocument = async (token: string, documentId: string): Promise<UserDocument[]> => {
  const res = await fetch(`${API_URL}/documents/${documentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.data;
};
