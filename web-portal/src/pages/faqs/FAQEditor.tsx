import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { mockFAQs } from '@/mocks/content.mock';

export function FAQEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = id && id !== 'new';

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('Pregnancy Basics');

  useEffect(() => {
    if (isEditing) {
      const faq = mockFAQs.find((f) => f.id === id);
      if (faq) { setQuestion(faq.question); setAnswer(faq.answer); setCategory(faq.category); }
    }
  }, [id, isEditing]);

  const handleSave = () => {
    if (!question.trim() || !answer.trim()) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Question and answer are required.' });
      return;
    }
    toast({ title: isEditing ? 'FAQ Updated' : 'FAQ Created', description: 'The FAQ has been saved.' });
    navigate('/faqs');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/faqs')}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h2 className="text-xl font-bold text-navy">{isEditing ? 'Edit FAQ' : 'New FAQ'}</h2><p className="text-sm text-muted-foreground">{isEditing ? 'Update FAQ content' : 'Create a new frequently asked question'}</p></div>
      </div>
      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="text-base">FAQ Details</CardTitle><CardDescription>Fill in the question, answer, and category</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Question</Label><Input placeholder="Enter the question" value={question} onChange={(e) => setQuestion(e.target.value)} /></div>
          <div className="space-y-2"><Label>Answer</Label><Textarea placeholder="Enter the answer" value={answer} onChange={(e) => setAnswer(e.target.value)} className="min-h-[150px]" /></div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" />Save</Button>
            <Button variant="outline" onClick={() => navigate('/faqs')}><ArrowLeft className="mr-2 h-4 w-4" />Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
