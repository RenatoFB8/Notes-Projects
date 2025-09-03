type Props = {
  note: { id: string; title: string; content: string; createdAt: string };
  onEdit?: (noteId: string) => void;
  onDelete?: (noteId: string) => void;
};

export function NoteCard({ note, onEdit, onDelete }: Props) {
  return (
    <article className="note" aria-label={`Note ${note.title}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 , alignItems: 'center'}}>
        <h4 style={{ margin: 0 }}>{note.title}</h4>
        <div style={{ display: 'flex', gap: 6 }}>
          {onEdit && <button className="ghost" onClick={() => onEdit(note.id)} aria-label="Edit note">✎</button>}
          {onDelete && <button className="ghost" onClick={() => onDelete(note.id)} aria-label="Delete note">🗑</button>}
        </div>
      </div>
      <p className="" style={{ whiteSpace: 'pre-wrap' }}>{note.content}</p>
      <small>{new Date(note.createdAt).toLocaleString()}</small>
    </article>
  );
}
