"use client";

import { useState } from "react";
import { ContentTypeDefinition } from "@/types/content-type";
import { parseContentTypeConfig } from "@/lib/utils/content-types";
import { useActionState } from "@/hooks/useActionState";
import {
  addContentType,
  updateContentType,
  deleteContentType,
} from "./actions";
import Button from "@/ui/Button";
import InputField from "@/ui/InputField";
import TextareaField from "@/ui/TextareaField";
import { MessageAlert } from "@/components/MessageAlert";

interface Props {
  organizationId: string;
  contentTypeConfig: string | null;
}

type ModalMode = "add" | "edit" | null;

export function ContentTypesSettings({
  organizationId,
  contentTypeConfig,
}: Props) {
  const config = parseContentTypeConfig(contentTypeConfig);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingType, setEditingType] = useState<ContentTypeDefinition | null>(
    null,
  );
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");

  // Action states
  const addState = useActionState();
  const updateState = useActionState();
  const deleteState = useActionState();

  const resetForm = () => {
    setValue("");
    setLabel("");
    setDescription("");
    setIcon("");
    setEditingType(null);
    setModalMode(null);
    addState.clearErrors();
    updateState.clearErrors();
  };

  const openAddModal = () => {
    resetForm();
    setModalMode("add");
  };

  const openEditModal = (type: ContentTypeDefinition) => {
    setValue(type.value);
    setLabel(type.label);
    setDescription(type.description || "");
    setIcon(type.icon || "");
    setEditingType(type);
    setModalMode("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const contentType: ContentTypeDefinition = {
      value: value.toLowerCase().replace(/\s+/g, "-"),
      label,
      description: description || undefined,
      icon: icon || undefined,
    };

    if (modalMode === "add") {
      const success = await addState.execute(addContentType, {
        organizationId,
        contentType,
      });
      if (success) {
        resetForm();
      }
    } else if (modalMode === "edit" && editingType) {
      const success = await updateState.execute(updateContentType, {
        organizationId,
        originalValue: editingType.value,
        contentType,
      });
      if (success) {
        resetForm();
      }
    }
  };

  const handleDelete = async (typeValue: string) => {
    const success = await deleteState.execute(deleteContentType, {
      organizationId,
      typeValue,
    });
    if (success) {
      setDeleteConfirm(null);
      deleteState.clearErrors();
    }
  };

  const activeState = modalMode === "add" ? addState : updateState;

  return (
    <div className="bg-surface rounded-lg p-6 shadow border border-border">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold">Content Types</h3>
          <p className="text-sm text-text-muted mt-1">
            Define which content types are available for this organization
          </p>
        </div>
        <Button
          type="button"
          label="+ Add Type"
          variant="solid"
          color="primary"
          onClick={openAddModal}
        />
      </div>

      {/* Delete Error Alert */}
      {deleteState.message && deleteState.message.type === "error" && (
        <MessageAlert message={deleteState.message} className="mb-4" />
      )}

      {/* Content Types List */}
      {config.types.length === 0 ? (
        <p className="text-text-muted">No content types defined.</p>
      ) : (
        <div className="space-y-2">
          {config.types.map((type) => (
            <div
              key={type.value}
              className="flex justify-between items-center p-3 rounded border border-border hover:bg-surface-hover transition"
            >
              <div className="flex items-center gap-3">
                {type.icon && <span className="text-xl">{type.icon}</span>}
                <div>
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm text-text-muted font-mono">
                    {type.value}
                  </div>
                  {type.description && (
                    <div className="text-sm text-text-muted mt-1">
                      {type.description}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  label="Edit"
                  variant="plain"
                  color="secondary"
                  onClick={() => openEditModal(type)}
                />
                {deleteConfirm === type.value ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-muted">Sure?</span>
                    <Button
                      type="button"
                      label="Yes"
                      variant="plain"
                      color="danger"
                      onClick={() => handleDelete(type.value)}
                      disabled={deleteState.isLoading}
                    />
                    <Button
                      type="button"
                      label="No"
                      variant="plain"
                      color="secondary"
                      onClick={() => {
                        setDeleteConfirm(null);
                        deleteState.clearErrors();
                      }}
                    />
                  </div>
                ) : (
                  <Button
                    type="button"
                    label="Delete"
                    variant="plain"
                    color="danger"
                    onClick={() => setDeleteConfirm(type.value)}
                    disabled={config.types.length <= 1}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 w-full max-w-md shadow-xl border border-border">
            <h4 className="text-lg font-bold mb-4">
              {modalMode === "add" ? "Add Content Type" : "Edit Content Type"}
            </h4>

            {activeState.message && activeState.message.type === "error" && (
              <MessageAlert message={activeState.message} className="mb-4" />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                id="content-type-value"
                type="text"
                label="Value (URL-safe identifier)"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g., blog-post"
                required
                disabled={modalMode === "edit"}
              />
              {modalMode === "edit" && (
                <p className="text-xs text-text-muted -mt-2">
                  Value cannot be changed after creation to prevent data loss.
                </p>
              )}

              <InputField
                id="content-type-label"
                type="text"
                label="Label (Display name)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Blog Post"
                required
              />

              <TextareaField
                id="content-type-description"
                label="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this content type used for?"
                rows={2}
              />

              <InputField
                id="content-type-icon"
                type="text"
                label="Icon (emoji, optional)"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="e.g., 📝"
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  label="Cancel"
                  variant="outline"
                  color="secondary"
                  onClick={resetForm}
                />
                <Button
                  type="submit"
                  label={
                    activeState.isLoading
                      ? "Saving..."
                      : modalMode === "add"
                        ? "Add Type"
                        : "Save Changes"
                  }
                  variant="solid"
                  color="primary"
                  disabled={activeState.isLoading}
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
