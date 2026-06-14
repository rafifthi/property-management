"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  Download,
  Eye,
  File,
  FileImage,
  FileText,
  Folder,
  FolderPlus,
  Grid2X2,
  HardDrive,
  List,
  MoreVertical,
  Search,
  UploadCloud,
  X
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatusTag from "@/components/StatusTag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import { documents } from "@/lib/sample-data";
import type { Document } from "@/lib/types";

type ViewMode = "Grid" | "List";

type DriveItem = {
  id: string;
  name: string;
  type: "folder" | "file";
  parentId: string | null;
  category?: Document["category"] | "folder";
  expiryDate?: string;
  relatedLabel?: string;
  mimeType?: string;
  size?: number;
  objectUrl?: string;
  textContent?: string;
  uploadedAt?: string;
};

const rootFolderId = "root";

const initialFolders: DriveItem[] = [
  { id: rootFolderId, name: "My Documents", type: "folder", parentId: null, category: "folder" },
  { id: "folder-contracts", name: "Contracts", type: "folder", parentId: rootFolderId, category: "folder" },
  { id: "folder-tenants", name: "Tenant IDs", type: "folder", parentId: rootFolderId, category: "folder" },
  { id: "folder-permits", name: "Property permits", type: "folder", parentId: rootFolderId, category: "folder" },
  { id: "folder-utilities", name: "Utilities", type: "folder", parentId: rootFolderId, category: "folder" }
];

const folderForCategory: Record<Document["category"], string> = {
  contract: "folder-contracts",
  personal: "folder-tenants",
  other: "folder-permits"
};

function seedFileFromDocument(doc: Document): DriveItem {
  return {
    id: doc.id,
    name: `${doc.name}.pdf`,
    type: "file",
    parentId: folderForCategory[doc.category],
    category: doc.category,
    expiryDate: doc.expiryDate,
    relatedLabel: doc.relatedType ? `${doc.relatedType}: ${doc.relatedId}` : "Standalone",
    mimeType: "application/pdf",
    size: 480000,
    uploadedAt: "2026-06-01T04:00:00.000Z"
  };
}

const initialItems: DriveItem[] = [...initialFolders, ...documents.map(seedFileFromDocument)];

function fileIcon(item: DriveItem) {
  if (item.type === "folder") return <Folder size={22} />;
  if (item.mimeType?.startsWith("image/")) return <FileImage size={22} />;
  if (item.mimeType === "application/pdf") return <FileText size={22} />;
  return <File size={22} />;
}

function formatFileSize(size?: number) {
  if (!size) return "-";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function itemDate(item: DriveItem) {
  return item.uploadedAt ? formatDate(item.uploadedAt) : "-";
}

function canPreview(item?: DriveItem) {
  if (!item || item.type !== "file") return false;
  return Boolean(item.objectUrl || item.textContent || item.mimeType === "application/pdf" || item.mimeType?.startsWith("image/"));
}

export default function DocumentsPage() {
  const [items, setItems] = useState<DriveItem[]>(initialItems);
  const [currentFolderId, setCurrentFolderId] = useState(rootFolderId);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("Grid");
  const [isDragging, setIsDragging] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(documents[0]?.id ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);

  const currentFolder = items.find((item) => item.id === currentFolderId);
  const selectedItem = items.find((item) => item.id === selectedItemId && item.type === "file");

  const breadcrumbs = useMemo(() => {
    const path: DriveItem[] = [];
    let cursor = currentFolder;
    while (cursor) {
      path.unshift(cursor);
      cursor = cursor.parentId ? items.find((item) => item.id === cursor?.parentId) : undefined;
    }
    return path;
  }, [currentFolder, items]);

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const scope = normalizedQuery ? items.filter((item) => item.id !== rootFolderId) : items.filter((item) => item.parentId === currentFolderId);
    return scope
      .filter((item) => !normalizedQuery || `${item.name} ${item.relatedLabel ?? ""}`.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }, [currentFolderId, items, query]);

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;
    return () => { objectUrls.forEach((url) => URL.revokeObjectURL(url)); };
  }, []);

  const addFiles = async (files: FileList | File[]) => {
    const nextFiles = await Promise.all(
      Array.from(files).map(async (file) => {
        const objectUrl = URL.createObjectURL(file);
        objectUrlsRef.current.push(objectUrl);
        return {
          id: `file-${crypto.randomUUID()}`,
          name: file.name,
          type: "file" as const,
          parentId: currentFolderId,
          category: "other" as const,
          mimeType: file.type || "application/octet-stream",
          objectUrl,
          size: file.size,
          textContent: file.type.startsWith("text/") ? await file.text() : undefined,
          uploadedAt: new Date().toISOString()
        };
      })
    );
    setItems((prev) => [...prev, ...nextFiles]);
    setSelectedItemId(nextFiles[0]?.id ?? selectedItemId);
  };

  const createFolder = () => {
    const trimmedName = newFolderName.trim();
    if (!trimmedName) return;
    const folder: DriveItem = {
      id: `folder-${crypto.randomUUID()}`,
      name: trimmedName,
      type: "folder",
      parentId: currentFolderId,
      category: "folder"
    };
    setItems((prev) => [...prev, folder]);
    setCurrentFolderId(folder.id);
    setNewFolderName("");
    setIsFolderModalOpen(false);
  };

  const openItem = (item: DriveItem) => {
    if (item.type === "folder") { setCurrentFolderId(item.id); setQuery(""); return; }
    setSelectedItemId(item.id);
  };

  const removeSelectedItem = () => {
    if (!selectedItem) return;
    if (selectedItem.objectUrl) URL.revokeObjectURL(selectedItem.objectUrl);
    setItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
    setSelectedItemId(null);
  };

  return (
    <div className="documents-module">
      <PageHeader
        breadcrumbs={[{ href: "/", label: "Home" }, { label: "Documents" }]}
        title="Document Drive"
        copy="Organize contracts, tenant IDs, permits, receipts, and images into your own folder structure."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsFolderModalOpen(true)}>
              <FolderPlus size={16} /> New Folder
            </Button>
            <Button onClick={() => fileInputRef.current?.click()}>
              <UploadCloud size={16} /> Upload
            </Button>
          </div>
        }
      />

      <input
        aria-label="Upload documents"
        hidden
        multiple
        onChange={(event) => { if (event.target.files) void addFiles(event.target.files); event.currentTarget.value = ""; }}
        ref={fileInputRef}
        type="file"
      />

      <section className="documents-workspace">
        <aside className="documents-sidebar" aria-label="Document folders">
          <button className={currentFolderId === rootFolderId ? "is-active" : ""} onClick={() => setCurrentFolderId(rootFolderId)} type="button">
            <HardDrive size={16} /> My Drive
          </button>
          {items.filter((i) => i.type === "folder" && i.parentId === rootFolderId).map((folder) => (
            <button className={currentFolderId === folder.id ? "is-active" : ""} key={folder.id} onClick={() => setCurrentFolderId(folder.id)} type="button">
              <Folder size={16} /> {folder.name}
            </button>
          ))}
        </aside>

        <main
          className={`documents-browser ${isDragging ? "documents-browser--dragging" : ""}`}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); void addFiles(e.dataTransfer.files); }}
        >
          <div className="documents-browser__top">
            <nav className="documents-breadcrumb" aria-label="Document breadcrumb">
              {breadcrumbs.map((crumb, index) => (
                <span key={crumb.id}>
                  <button onClick={() => setCurrentFolderId(crumb.id)} type="button">{crumb.name}</button>
                  {index < breadcrumbs.length - 1 ? <ChevronRight size={14} /> : null}
                </span>
              ))}
            </nav>

            <div className="documents-tools">
              <Input className="documents-search" onChange={(e) => setQuery(e.target.value)} placeholder="Search documents..." value={query} />
              <div className="view-toggle">
                <button className={`view-toggle__btn${viewMode === "Grid" ? " view-toggle__btn--active" : ""}`} onClick={() => setViewMode("Grid")} type="button" aria-label="Grid view"><Grid2X2 size={15} /></button>
                <button className={`view-toggle__btn${viewMode === "List" ? " view-toggle__btn--active" : ""}`} onClick={() => setViewMode("List")} type="button" aria-label="List view"><List size={15} /></button>
              </div>
            </div>
          </div>

          <div className="documents-dropzone">
            <UploadCloud size={22} />
            <span>Drop files here or upload with the button. Files land in {currentFolder?.name ?? "this folder"}.</span>
          </div>

          {viewMode === "Grid" ? (
            <div className="documents-grid">
              {visibleItems.map((item) => (
                <button className={`documents-tile ${selectedItemId === item.id ? "is-selected" : ""}`} key={item.id} onClick={() => openItem(item)} type="button">
                  <div className={`documents-tile__icon documents-tile__icon--${item.type}`}>{fileIcon(item)}</div>
                  <strong>{item.name}</strong>
                  <span>{item.type === "folder" ? "Folder" : `${item.mimeType ?? "File"} / ${formatFileSize(item.size)}`}</span>
                  {item.category && item.category !== "folder" ? <StatusTag value={item.category} /> : null}
                </button>
              ))}
            </div>
          ) : (
            <div className="documents-list" role="table" aria-label="Documents">
              <div className="documents-list__row documents-list__row--head" role="row">
                <div>Name</div>
                <div>Category</div>
                <div>Size</div>
                <div>Modified</div>
                <div>Expiry</div>
                <div />
              </div>
              {visibleItems.map((item) => (
                <button className={`documents-list__row ${selectedItemId === item.id ? "is-selected" : ""}`} key={item.id} onClick={() => openItem(item)} role="row" type="button">
                  <div>
                    {fileIcon(item)}
                    <span>
                      <strong>{item.name}</strong>
                      <small>{item.relatedLabel ?? (item.type === "folder" ? "Folder" : item.mimeType)}</small>
                    </span>
                  </div>
                  <div>{item.category && item.category !== "folder" ? <StatusTag value={item.category} /> : "-"}</div>
                  <div>{item.type === "folder" ? "-" : formatFileSize(item.size)}</div>
                  <div>{itemDate(item)}</div>
                  <div>{item.expiryDate ? formatDate(item.expiryDate) : "-"}</div>
                  <div><MoreVertical size={16} /></div>
                </button>
              ))}
            </div>
          )}
        </main>

        <aside className="documents-viewer" aria-label="Document viewer">
          <div className="documents-viewer__header">
            <div>
              <span>Preview</span>
              <strong>{selectedItem?.name ?? "No file selected"}</strong>
            </div>
            {selectedItem ? (
              <button aria-label="Close preview" className="text-muted-foreground hover:text-foreground" onClick={() => setSelectedItemId(null)} type="button"><X size={15} /></button>
            ) : null}
          </div>

          {selectedItem ? (
            <>
              <div className="documents-preview">
                {selectedItem.mimeType?.startsWith("image/") && selectedItem.objectUrl ? (
                  <img alt={selectedItem.name} src={selectedItem.objectUrl} />
                ) : selectedItem.mimeType === "application/pdf" && selectedItem.objectUrl ? (
                  <iframe src={selectedItem.objectUrl} title={selectedItem.name} />
                ) : selectedItem.textContent ? (
                  <pre>{selectedItem.textContent}</pre>
                ) : canPreview(selectedItem) ? (
                  <div className="documents-preview__empty"><Eye size={24} /><strong>Viewer ready</strong><p>Upload an image, PDF, or text file to preview it inline.</p></div>
                ) : (
                  <div className="documents-preview__empty"><File size={24} /><strong>Preview unavailable</strong><p>This file type can be stored and downloaded, but cannot be previewed inline yet.</p></div>
                )}
              </div>
              <div className="documents-viewer__meta">
                <div><span>Type</span><strong>{selectedItem.mimeType ?? "File"}</strong></div>
                <div><span>Size</span><strong>{formatFileSize(selectedItem.size)}</strong></div>
                <div><span>Expiry</span><strong>{selectedItem.expiryDate ? formatDate(selectedItem.expiryDate) : "-"}</strong></div>
                <div><span>Linked to</span><strong>{selectedItem.relatedLabel ?? "Standalone"}</strong></div>
              </div>
              <div className="documents-viewer__actions">
                <Button variant="outline" disabled={!selectedItem.objectUrl} onClick={() => selectedItem.objectUrl && window.open(selectedItem.objectUrl)}><Download size={15} /> Download</Button>
                <Button variant="destructive" onClick={removeSelectedItem}>Delete</Button>
              </div>
            </>
          ) : (
            <div className="documents-preview documents-preview__empty"><Eye size={24} /><strong>Select a file</strong><p>Choose a document to preview images, PDFs, text files, and metadata in this panel.</p></div>
          )}
        </aside>
      </section>

      <Dialog open={isFolderModalOpen} onOpenChange={setIsFolderModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create folder</DialogTitle></DialogHeader>
          <Input autoFocus onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createFolder()} placeholder="Folder name" value={newFolderName} />
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={createFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
