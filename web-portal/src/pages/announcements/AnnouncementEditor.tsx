import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { mockAnnouncements } from '@/mocks/content.mock';

export function AnnouncementEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = id && id !== 'new';
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [publishDate, setPublishDate] = useState('');

  useEffect(() => {
    if (isEditing) {
      const item = mockAnnouncements.find((a) => a.id === id);
      if (item) { setTitle(item.title); setBody(item.body); setPublishDate(item.publishDate.split('T')[0]); }
    } else {
      setPublishDate(new Date().toISOString().split('T')[0]);
    }
  }, [id, isEditing]);

  const handleSave = () => {
    if (!title.trim() || !body.trim()) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Title and body are required.' });
      return;
    }
    toast({ title: isEditing ? 'Announcement Updated' : 'Announcement Created', description: 'The announcement has been saved.' });
    navigate('/announcements');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/announcements')}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h2 className="text-xl font-bold text-navy">{isEditing ? 'Edit Announcement' : 'New Announcement'}</h2><p className="text-sm text-muted-foreground">{isEditing ? 'Update announcement content' : 'Create a new platform announcement'}</p></div>
      </div>
      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="text-base">Announcement Details</CardTitle><CardDescription>Fill in the announcement title, body, and publish date</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Title</Label><Input placeholder="Announcement title" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="space-y-2"><Label>Body</Label><Textarea placeholder="Announcement content" value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[150px]" /></div>
          <div className="space-y-2"><Label>Publish Date</Label><Input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} /></div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" />Save</Button>
            <Button variant="outline" onClick={() => navigate('/announcements')}><ArrowLeft className="mr-2 h-4 w-4" />Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
