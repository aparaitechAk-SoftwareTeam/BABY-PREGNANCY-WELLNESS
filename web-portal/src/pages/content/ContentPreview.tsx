import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '@/services/content.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/tables/DataTableCard';
import { ArrowLeft, Edit, FileText, Calendar, BookOpen, User } from 'lucide-react';
import { formatDateTime } from '@/utils/format';

export function ContentPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: content, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentApi.fetchContentById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-32" /><Skeleton className="h-96 w-full" /></div>;
  }

  if (!content) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Content not found.</p>
        <Button variant="outline" onClick={() => navigate('/content')}>Back to Content</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/content')}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h2 className="text-xl font-bold text-navy">Content Preview</h2>
            <p className="text-sm text-muted-foreground">Preview how this article will appear to users</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/content/${content.id}`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <div className="mb-3 flex items-center gap-2">
            <StatusBadge status={content.status} />
            <span className="text-xs text-muted-foreground capitalize">{content.type.replace('_', ' ')}</span>
            {content.week > 0 && <span className="text-xs text-muted-foreground">- Week {content.week}</span>}
          </div>
          <CardTitle className="text-2xl font-bold text-navy">{content.title}</CardTitle>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {content.author}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDateTime(content.updatedAt)}</span>
            <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> v{content.version}</span>
            <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {content.source}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-6 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground italic">{content.summary}</p>
          <div className="prose prose-sm max-w-none">
            {content.body.split('\n').map((line, idx) => {
              if (line.startsWith('## ')) {
                return <h3 key={idx} className="mt-4 mb-2 text-lg font-semibold text-navy">{line.replace('## ', '')}</h3>;
              }
              if (line.startsWith('- ')) {
                return <li key={idx} className="ml-4 text-sm text-foreground">{line.replace('- ', '')}</li>;
              }
              if (line.trim() === '') {
                return <div key={idx} className="h-3" />;
              }
              return <p key={idx} className="text-sm leading-relaxed text-foreground">{line}</p>;
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
