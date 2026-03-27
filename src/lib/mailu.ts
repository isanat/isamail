// Mailu API client for email server management
// Server: 207.180.209.114
// Admin URL: https://mail.isamail.space/admin

const MAILU_API_URL = process.env.MAILU_API_URL || 'https://mail.isamail.space/api/v1';
const MAILU_API_KEY = process.env.MAILU_API_KEY || '';
const MAILU_ADMIN_URL = process.env.MAILU_ADMIN_URL || 'https://mail.isamail.space/admin';

interface MailuResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface DomainInfo {
  name: string;
  managers: string[];
  alternatives: string[];
  dkim_key: string;
  dkim_publickey: string;
  generated_ns: string[];
  max_users: number;
  max_aliases: number;
  max_quota_bytes: number;
  signup_enabled: boolean;
  comment: string;
}

interface UserInfo {
  email: string;
  name: string;
  enabled: boolean;
  quota_bytes: number;
  global_admin: boolean;
  domain: string;
  keys: string[];
  forward_enabled: boolean;
  forward_destination: string[];
  reply_enabled: boolean;
  reply_subject: string;
  reply_body: string;
  reply_enddate: string;
  reply_startdate: string;
}

interface DKIMInfo {
  dkim_publickey: string;
  dkim_key: string;
}

// Generic request helper
async function mailuRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  body?: Record<string, unknown>
): Promise<MailuResponse<T>> {
  try {
    const url = `${MAILU_API_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (MAILU_API_KEY) {
      headers['Authorization'] = `Bearer ${MAILU_API_KEY}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: errorText || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Mailu API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Create a new domain
export async function createDomain(
  domain: string,
  options?: {
    maxUsers?: number;
    maxAliases?: number;
    maxQuotaBytes?: number;
    signupEnabled?: boolean;
    comment?: string;
  }
): Promise<MailuResponse<void>> {
  return mailuRequest<void>('/domain', 'POST', {
    name: domain,
    max_users: options?.maxUsers || 0,
    max_aliases: options?.maxAliases || 0,
    max_quota_bytes: options?.maxQuotaBytes || 0,
    signup_enabled: options?.signupEnabled || false,
    comment: options?.comment || '',
  });
}

// Get domain information
export async function getDomain(domain: string): Promise<MailuResponse<DomainInfo>> {
  return mailuRequest<DomainInfo>(`/domain/${encodeURIComponent(domain)}`);
}

// Delete a domain
export async function deleteDomain(domain: string): Promise<MailuResponse<void>> {
  return mailuRequest<void>(`/domain/${encodeURIComponent(domain)}`, 'DELETE');
}

// List all domains
export async function listDomains(): Promise<MailuResponse<string[]>> {
  return mailuRequest<string[]>('/domain');
}

// Create a new email user
export async function createUser(
  email: string,
  password: string,
  options?: {
    name?: string;
    quotaBytes?: number;
    globalAdmin?: boolean;
    enabled?: boolean;
  }
): Promise<MailuResponse<void>> {
  const [localPart, domain] = email.split('@');
  
  if (!domain) {
    return {
      success: false,
      error: 'Email inválido',
    };
  }

  return mailuRequest<void>('/user', 'POST', {
    email,
    local_part: localPart,
    domain,
    password,
    name: options?.name || localPart,
    quota_bytes: options?.quotaBytes || 0,
    global_admin: options?.globalAdmin || false,
    enabled: options?.enabled !== false,
  });
}

// Get user information
export async function getUser(email: string): Promise<MailuResponse<UserInfo>> {
  return mailuRequest<UserInfo>(`/user/${encodeURIComponent(email)}`);
}

// Delete a user
export async function deleteUser(email: string): Promise<MailuResponse<void>> {
  return mailuRequest<void>(`/user/${encodeURIComponent(email)}`, 'DELETE');
}

// Update user password
export async function updateUserPassword(
  email: string,
  password: string
): Promise<MailuResponse<void>> {
  return mailuRequest<void>(`/user/${encodeURIComponent(email)}`, 'PATCH', {
    password,
  });
}

// Update user quota
export async function updateUserQuota(
  email: string,
  quotaBytes: number
): Promise<MailuResponse<void>> {
  return mailuRequest<void>(`/user/${encodeURIComponent(email)}`, 'PATCH', {
    quota_bytes: quotaBytes,
  });
}

// Enable/disable user
export async function setUserEnabled(
  email: string,
  enabled: boolean
): Promise<MailuResponse<void>> {
  return mailuRequest<void>(`/user/${encodeURIComponent(email)}`, 'PATCH', {
    enabled,
  });
}

// List all users in a domain
export async function listUsers(domain?: string): Promise<MailuResponse<UserInfo[]>> {
  const endpoint = domain ? `/user/domain/${encodeURIComponent(domain)}` : '/user';
  return mailuRequest<UserInfo[]>(endpoint);
}

// Get DKIM information for a domain
export async function getDKIM(domain: string): Promise<MailuResponse<DKIMInfo>> {
  return mailuRequest<DKIMInfo>(`/dkim/${encodeURIComponent(domain)}`);
}

// Generate DKIM keys for a domain
export async function generateDKIM(domain: string): Promise<MailuResponse<DKIMInfo>> {
  return mailuRequest<DKIMInfo>(`/dkim/${encodeURIComponent(domain)}`, 'POST');
}

// Get DNS records to configure for a domain
export function getDNSRecords(domain: string, dkimPublicKey?: string) {
  const mxRecord = `10 mail.isamail.space.`;
  const spfRecord = `v=spf1 mx a:mail.isamail.space ~all`;
  const dkimRecord = dkimPublicKey 
    ? `v=DKIM1; k=rsa; p=${dkimPublicKey}`
    : null;
  const dmarcRecord = `v=DMARC1; p=quarantine; rua=mailto:postmaster@${domain}`;

  return {
    mx: {
      type: 'MX',
      name: '@',
      value: mxRecord,
      priority: 10,
    },
    spf: {
      type: 'TXT',
      name: '@',
      value: spfRecord,
    },
    dkim: {
      type: 'TXT',
      name: 'dkim._domainkey',
      value: dkimRecord,
    },
    dmarc: {
      type: 'TXT',
      name: '_dmarc',
      value: dmarcRecord,
    },
  };
}

// Check if Mailu API is accessible
export async function checkConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${MAILU_API_URL}/domain`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MAILU_API_KEY}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Get admin URL for manual configuration
export function getAdminUrl(): string {
  return MAILU_ADMIN_URL;
}

// Get server IP
export function getServerIP(): string {
  return '207.180.209.114';
}

// Check if Mailu is configured
export function isMailuConfigured(): boolean {
  return Boolean(MAILU_API_KEY);
}
