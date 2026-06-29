/* eslint-disable no-unused-vars */

declare type FileType = "document" | "image" | "video" | "audio" | "other";

declare interface ActionType {
  label: string;
  icon: string;
  value: string;
}

declare interface SearchParamProps {
  params?: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

declare interface FileOwner {
  fullName: string;
  email: string;
  walletAddress: string;
}

/**
 * File shape returned by the server actions. Field names mirror the original
 * StoreIt (Appwrite) document so ported UI components need no changes.
 */
declare interface FileDocument {
  $id: string;
  name: string;
  url: string;
  type: FileType | string;
  extension: string;
  size: number;
  cid: string;
  bucketFileId: string;
  owner: FileOwner;
  ownerId: string;
  users: string[];
  sharedWith: string[];
  $createdAt: string;
  $updatedAt: string;
}

declare interface CurrentUser {
  $id: string;
  accountId: string;
  fullName: string;
  email: string;
  avatar: string;
  walletAddress: string;
}

declare interface UploadFileProps {
  file: File;
  ownerId: string;
  accountId: string;
  path: string;
}
declare interface GetFilesProps {
  types: FileType[];
  searchText?: string;
  sort?: string;
  limit?: number;
}
declare interface RenameFileProps {
  fileId: string;
  name: string;
  extension: string;
  path: string;
}
declare interface UpdateFileUsersProps {
  fileId: string;
  emails: string[];
  path: string;
}
declare interface DeleteFileProps {
  fileId: string;
  bucketFileId: string;
  path: string;
}

declare interface FileUploaderProps {
  ownerId: string;
  accountId: string;
  className?: string;
}

declare interface MobileNavigationProps {
  $id: string;
  accountId: string;
  fullName: string;
  avatar: string;
  email: string;
}
declare interface SidebarProps {
  fullName: string;
  avatar: string;
  email: string;
}

declare interface ThumbnailProps {
  type: string;
  extension: string;
  url: string;
  className?: string;
  imageClassName?: string;
}

declare interface ShareInputProps {
  file: FileDocument;
  onInputChange: React.Dispatch<React.SetStateAction<string[]>>;
  onRemove: (email: string) => void;
}
