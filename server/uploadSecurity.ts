import { Problem, ProblemEvidence, User } from '../src/types';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  mimeType?: string;
  extension?: string;
  sizeBytes?: number;
  sanitizedFileName?: string;
}

// Security Configuration
export const ALLOWED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'webp', 'gif',
  'pdf', 'txt', 'csv', 'doc', 'docx',
  'mp4', 'webm', 'mov'
]);

export const FORBIDDEN_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'sh', 'php', 'phtml', 'js', 'ts', 'html', 'htm',
  'vbs', 'ps1', 'py', 'pl', 'jar', 'msi', 'dll', 'so', 'cgi', 'asp', 'aspx', 'jsp', 'wasm'
]);

export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'video/mp4',
  'video/webm',
  'video/quicktime'
]);

export const MAX_IMAGE_DOC_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

/**
 * Parses file size representation into bytes
 */
export function parseSizeBytes(sizeInput?: string | number): number {
  if (typeof sizeInput === 'number') return sizeInput;
  if (!sizeInput) return 1024 * 1024; // Default 1MB fallback if unspecified

  const str = sizeInput.toString().trim().toUpperCase();
  const match = str.match(/^([\d.]+)\s*(BYTES|B|KB|MB|GB)?$/);
  if (!match) return 1024 * 1024;

  const value = parseFloat(match[1]);
  const unit = match[2] || 'MB';

  switch (unit) {
    case 'BYTES':
    case 'B':
      return value;
    case 'KB':
      return value * 1024;
    case 'MB':
      return value * 1024 * 1024;
    case 'GB':
      return value * 1024 * 1024 * 1024;
    default:
      return value * 1024 * 1024;
  }
}

/**
 * Strictly validates file metadata:
 * - Extension check & Double Extension Anti-Spoofing
 * - MIME type validation
 * - File size limits based on category
 */
export function validateFileSecurity(file: {
  fileName: string;
  type?: string;
  mimeType?: string;
  fileSize?: string | number;
  fileSizeBytes?: number;
}): FileValidationResult {
  if (!file.fileName || typeof file.fileName !== 'string') {
    return { valid: false, error: 'File validation failed: File name is required.' };
  }

  const sanitizedFileName = file.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const parts = sanitizedFileName.toLowerCase().split('.');

  if (parts.length < 2) {
    return { valid: false, error: 'File validation failed: File extension missing.' };
  }

  const extension = parts[parts.length - 1];

  // 1. Check for Forbidden Extensions anywhere in double extensions (e.g., malware.php.jpg)
  for (let i = 0; i < parts.length - 1; i++) {
    if (FORBIDDEN_EXTENSIONS.has(parts[i])) {
      return {
        valid: false,
        error: `Security Violation: Double extension or executable script name detected (".${parts[i]}"). Upload rejected.`
      };
    }
  }

  if (FORBIDDEN_EXTENSIONS.has(extension)) {
    return {
      valid: false,
      error: `Security Violation: File extension ".${extension}" is dangerous and explicitly forbidden.`
    };
  }

  // 2. Check Extension Whitelist
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return {
      valid: false,
      error: `Invalid File Extension: ".${extension}" is not allowed. Allowed types: Images (JPG, PNG, WEBP), Documents (PDF, DOCX, TXT), Videos (MP4, WEBM).`
    };
  }

  // 3. Validate MIME Type if provided
  let mimeType = file.mimeType;
  if (!mimeType) {
    if (['jpg', 'jpeg'].includes(extension)) mimeType = 'image/jpeg';
    else if (extension === 'png') mimeType = 'image/png';
    else if (extension === 'webp') mimeType = 'image/webp';
    else if (extension === 'gif') mimeType = 'image/gif';
    else if (extension === 'pdf') mimeType = 'application/pdf';
    else if (extension === 'txt') mimeType = 'text/plain';
    else if (extension === 'csv') mimeType = 'text/csv';
    else if (extension === 'doc') mimeType = 'application/msword';
    else if (extension === 'docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else if (extension === 'mp4') mimeType = 'video/mp4';
    else if (extension === 'webm') mimeType = 'video/webm';
    else if (extension === 'mov') mimeType = 'video/quicktime';
  }

  if (mimeType && !ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: `Security Violation: Unrecognized or forbidden MIME type "${mimeType}".`
    };
  }

  // 4. File Size Limits
  const sizeBytes = file.fileSizeBytes || parseSizeBytes(file.fileSize);
  const isVideo = extension === 'mp4' || extension === 'webm' || extension === 'mov' || file.type === 'video';
  const maxSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_DOC_SIZE_BYTES;

  if (sizeBytes > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    const currentMB = (sizeBytes / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File Size Limit Exceeded: Attached file is ${currentMB}MB, which exceeds the maximum limit of ${maxMB}MB.`
    };
  }

  return {
    valid: true,
    mimeType,
    extension,
    sizeBytes,
    sanitizedFileName
  };
}

/**
 * Validates ownership when adding evidence to an existing problem
 */
export function validateEvidenceOwnership(problem: Problem, user: User): { allowed: boolean; reason?: string } {
  if (!user || !user.id) {
    return { allowed: false, reason: 'Authentication required: User session is missing.' };
  }

  const userRoleNorm = (user.role || '').toUpperCase();

  // Government & Super Admins have system-wide authority
  if (['GOVERNMENT', 'GOVERNMENT_OFFICER', 'SUPER_ADMIN'].includes(userRoleNorm)) {
    return { allowed: true };
  }

  // Original problem submitter
  const isOwner = problem.submittedBy === user.id ||
                  (problem.submitterName && user.name && problem.submitterName.toLowerCase() === user.name.toLowerCase());
  if (isOwner) {
    return { allowed: true };
  }

  // Assigned University Lead / Faculty / Student
  const isAssignedUniversity = problem.assignedUniversityId && user.universityId &&
                               problem.assignedUniversityId === user.universityId;
  if (isAssignedUniversity) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Ownership Violation: User "${user.name}" does not own problem report ${problem.id} and is not an assigned authority.`
  };
}

/**
 * Access Permission Check: Ensures evidence does not automatically become public.
 * Evidence is RESTRICTED to problem owners, assigned university, and government officials by default.
 */
export function canUserAccessEvidence(problem: Problem, evidence: ProblemEvidence, user?: User | null): { allowed: boolean; reason?: string } {
  // 1. Explicitly Public Evidence
  if (evidence.isPublic === true || evidence.visibility === 'PUBLIC') {
    return { allowed: true };
  }

  // 2. Private/Restricted Evidence requires authenticated user
  if (!user || !user.id) {
    return {
      allowed: false,
      reason: 'Access Denied: Evidence is private and restricted to authorized problem owners and officials. Please log in.'
    };
  }

  const userRoleNorm = (user.role || '').toUpperCase();

  // Government officers & Super Admins can access all evidence for review
  if (['GOVERNMENT', 'GOVERNMENT_OFFICER', 'SUPER_ADMIN'].includes(userRoleNorm)) {
    return { allowed: true };
  }

  // Problem owner / submitter
  if (problem.submittedBy === user.id || (problem.submitterName && user.name && problem.submitterName.toLowerCase() === user.name.toLowerCase())) {
    return { allowed: true };
  }

  // Assigned University
  if (problem.assignedUniversityId && user.universityId && problem.assignedUniversityId === user.universityId) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'Access Denied: You do not have permission to view or download this private evidence.'
  };
}
