"use client";

import type { FC } from "react";
import { useMemo, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type PlanCard = {
  id: string;
  title: string;
  impact: string;
  effort: string;
  owner: string;
  due: string;
};

type Column = {
  title: string;
  items: PlanCard[];
};

type ColumnState = Column & {
  id: string;
};

const impactBadge: Record<string, string> = {
  Alto: "border-emerald-200 bg-emerald-50 text-emerald-600",
  Medio: "border-amber-200 bg-amber-50 text-amber-600",
  Bajo: "border-border bg-surface text-text-body",
};

const effortBadge: Record<string, string> = {
  Alto: "border-rose-200 bg-rose-50 text-rose-600",
  Medio: "border-blue-200 bg-blue-50 text-blue-600",
  Bajo: "border-border bg-surface text-text-body",
};

const slugify = (value: string) =>
  `column-${value.toLowerCase().replace(/\s+/g, "-")}`;

type SortableCardProps = {
  item: PlanCard;
  onDelete?: (id: string) => void;
};

const SortableCard: FC<SortableCardProps> = ({ item, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`rounded-xl border border-border bg-surface-subtle p-3 text-sm shadow-inner transition ${
        isDragging ? "border-indigo-300 bg-surface shadow-lg" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-slate-800">{item.title}</p>
        {onDelete ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
            className="rounded-full border border-border px-2 py-0.5 text-[10px] text-text-body hover:bg-surface"
            aria-label="Eliminar"
          >
            ✕
          </button>
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-text-body">
        <span
          className={`rounded-full border px-2 py-0.5 font-medium ${
            impactBadge[item.impact] ?? impactBadge.Bajo
          }`}
        >
          Impacto {item.impact}
        </span>
        <span
          className={`rounded-full border px-2 py-0.5 ${
            effortBadge[item.effort] ?? effortBadge.Bajo
          }`}
        >
          Esfuerzo {item.effort}
        </span>
        <span>Owner: {item.owner}</span>
        <span>Due: {item.due}</span>
      </div>
    </div>
  );
};

type PlanColumnProps = {
  column: ColumnState;
  onDelete?: (id: string) => void;
};

const PlanColumn: FC<PlanColumnProps> = ({ column, onDelete }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <article
      ref={setNodeRef}
      className={`flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition ${
        isOver ? "border-indigo-300 shadow-md" : ""
      }`}
    >
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{column.title}</h3>
        <span className="text-xs text-text-muted">{column.items.length}</span>
      </header>
      <SortableContext
        items={column.items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {column.items.map((item) => (
            <SortableCard key={item.id} item={item} onDelete={onDelete} />
          ))}
          {column.items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border-strong bg-surface-subtle p-4 text-center text-xs font-medium text-text-muted">
              Soltar tarjetas aqui
            </p>
          ) : null}
        </div>
      </SortableContext>
    </article>
  );
};

export function PlanBoard({ columns, onMoveCard, onDeleteCard }: { columns: Column[]; onMoveCard?: (id: string, toColumnTitle: string) => void; onDeleteCard?: (id: string) => void }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const [board, setBoard] = useState<ColumnState[]>(() =>
    columns.map((column) => ({
      ...column,
      id: slugify(column.title),
    })),
  );

  const findColumnByCardId = (cardId: string): ColumnState | undefined =>
    board.find((column) => column.items.some((item) => item.id === cardId));

  const getColumnByDroppableId = (id: string): ColumnState | undefined =>
    board.find((column) => column.id === id);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) {
      return;
    }

    const activeColumn = findColumnByCardId(String(active.id));
    const overColumn =
      findColumnByCardId(String(over.id)) ??
      (typeof over.id === "string" ? getColumnByDroppableId(over.id) : undefined);

    if (!activeColumn || !overColumn) {
      return;
    }

    if (activeColumn.id === overColumn.id) {
      const oldIndex = activeColumn.items.findIndex(
        (item) => item.id === active.id,
      );
      const newIndex = overColumn.items.findIndex((item) => item.id === over.id);
      if (oldIndex === -1) {
        return;
      }

      setBoard((previous) =>
        previous.map((column) =>
          column.id === activeColumn.id
            ? {
                ...column,
                items: arrayMove(
                  column.items,
                  oldIndex,
                  newIndex < 0 ? column.items.length - 1 : newIndex,
                ),
              }
            : column,
        ),
      );
      return;
    }

    setBoard((previous) => {
      const updated = previous.map((column) => ({
        ...column,
        items: [...column.items],
      }));

      const fromColumn = updated.find((column) => column.id === activeColumn.id);
      const toColumn = updated.find((column) => column.id === overColumn.id);

      if (!fromColumn || !toColumn) {
        return previous;
      }

      const fromIndex = fromColumn.items.findIndex(
        (item) => item.id === active.id,
      );

      if (fromIndex === -1) {
        return previous;
      }

      const [movedCard] = fromColumn.items.splice(fromIndex, 1);
      const overIndex = toColumn.items.findIndex((item) => item.id === over.id);
      const insertIndex = overIndex === -1 ? toColumn.items.length : overIndex;
      toColumn.items.splice(insertIndex, 0, movedCard);

      if (onMoveCard && activeColumn.title !== overColumn.title) {
        onMoveCard(String(active.id), overColumn.title);
      }
      return updated;
    });
  };

  const stats = useMemo(() => {
    const total = board.reduce((acc, column) => acc + column.items.length, 0);
    const completed =
      board.find((column) => column.title === "Completado")?.items.length ?? 0;

    return {
      total,
      completed,
      completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }, [board]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-text-body">
          <span className="rounded-full border border-border bg-surface px-3 py-1">
            Total: <strong className="ml-1 text-text-heading">{stats.total}</strong>
          </span>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-600">
            Completado: {stats.completed} ({stats.completionRate}%)
          </span>
        </div>
        <p className="text-xs text-text-muted">
          Arrastra tarjetas entre columnas para re-priorizar.
        </p>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 lg:grid-cols-4">
          {board.map((column) => (
            <PlanColumn key={column.id} column={column} onDelete={onDeleteCard} />
          ))}
        </div>
      </DndContext>
    </section>
  );
}
