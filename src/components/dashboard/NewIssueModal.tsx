import  { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Maximize2 } from 'lucide-react';
import yaml from 'js-yaml';
import { Button } from '@/components/ui/button';
import { MarkdownEditor } from './MarkdownEditor';
import { useCreateIssue } from '@/hooks/useGithub';

interface NewIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TemplateDef {
  id: string;
  name: string;
  description: string;
  title?: string;
  labels?: string[];
  assignees?: string;
  body?: any[];
}

const TEMPLATE_FILES = [
  'bug_report.yml',
  'feature_request.yml',
  'blank_issue.yml'
];

export function NewIssueModal({ isOpen, onClose }: NewIssueModalProps) {
  const [templates, setTemplates] = useState<TemplateDef[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDef | null>(null);

  // Form State
  const [issueTitle, setIssueTitle] = useState('');
  const [issueBodies, setIssueBodies] = useState<Record<string, string>>({});
  const createIssueMutation = useCreateIssue();

  useEffect(() => {
    if (isOpen && templates.length === 0) {
      setLoading(true);
      Promise.all(
        TEMPLATE_FILES.map(async (file) => {
          try {
            const res = await fetch(`/templates/${file}`);
            if (!res.ok) throw new Error('File not found');
            const fileText = await res.text();
            const parsed = yaml.load(fileText) as Record<string, any>;
            return {
              id: file.replace('.yml', ''),
              name: parsed.name || 'Untitled',
              description: parsed.description || parsed.about || '',
              title: parsed.title || '',
              labels: Array.isArray(parsed.labels) ? parsed.labels : (parsed.labels ? [parsed.labels] : []),
              assignees: parsed.assignees || '',
              body: parsed.body || []
            } as TemplateDef;
          } catch (e) {
            console.error(`Failed to load ${file}`, e);
            return null;
          }
        })
      ).then(results => {
        setTemplates(results.filter(Boolean) as TemplateDef[]);
        setLoading(false);
      });
    }
  }, [isOpen, templates.length]);

  const handleSelectTemplate = (tpl: TemplateDef) => {
    setSelectedTemplate(tpl);
    setIssueTitle(tpl.title || '');
    
    // Initialize body fields
    const initialBodies: Record<string, string> = {};
    if (tpl.body) {
      tpl.body.forEach(field => {
        if (field.id) {
          initialBodies[field.id] = '';
        }
      });
    }
    setIssueBodies(initialBodies);
  };

  const handleBodyChange = (id: string, value: string) => {
    setIssueBodies(prev => ({ ...prev, [id]: value }));
  };

  const handleCreate = async () => {
    if (!selectedTemplate || !issueTitle.trim()) return;

    let fullBodyMarkdown = '';
    
    if (selectedTemplate.body) {
      selectedTemplate.body.forEach(field => {
        if (!field.attributes) return;
        const answer = issueBodies[field.id] || '_No response_';
        fullBodyMarkdown += `### ${field.attributes.label}\n\n${answer}\n\n`;
      });
    }

    try {
      await createIssueMutation.mutateAsync({
        title: issueTitle,
        body: fullBodyMarkdown.trim(),
        labels: selectedTemplate.labels || []
      });
      onClose()
      
    } catch (e) {
      console.error("Failed to create issue:", e);
      alert("이슈 생성에 실패했습니다. 관리자 권한 토큰을 확인하세요.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center bg-black/40 sm:p-6 md:p-12 overflow-hidden justify-center">
      
      {!selectedTemplate ? (
        <div 
          className="w-full max-w-200 bg-white rounded-xl shadow-lg border border-[#d0d7de] font-sans flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#d0d7de]">
            <h2 className="text-[14px] font-semibold text-[#24292f]">Create new issue</h2>
            <div className="flex items-center space-x-3 text-[#57606a]">
              <button 
                className="hover:text-[#24292f] transition-colors focus:outline-none"
                onClick={onClose}
              >
                <X className="w-4.5 h-4.5 opacity-80" />
              </button>
            </div>
          </div>

          {/* Templates List */}
          <div className="flex flex-col min-h-25">
            {loading ? (
              <div className="flex justify-center items-center py-10 text-[#57606a]">
                <span className="text-[14px] font-semibold animate-pulse">Loading templates...</span>
              </div>
            ) : (
              templates.map((tpl, index) => (
                <div 
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`flex items-center justify-between px-6 py-4 hover:bg-[#f6f8fa] cursor-pointer transition-colors ${
                    index !== templates.length - 1 ? 'border-b border-[#d0d7de]' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-[16px] font-semibold text-[#24292f] mb-1 leading-tight">
                      {tpl.name}
                    </span>
                    <span className="text-[14px] text-[#57606a]">
                      {tpl.description}
                    </span>
                  </div>
                  
                  <div className="text-[#57606a] opacity-80 px-2">
                    <ArrowRight className="w-5 h-5 pointer-events-none" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        // ********************************
        // DETAILED FORM VIEW
        // ********************************
        <div 
          className="w-full max-w-225 bg-white rounded-xl shadow-lg border border-[#d0d7de] font-sans flex flex-col flex-1 max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Form Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#d0d7de] bg-white shrink-0">
            <div className="flex items-center text-[#57606a]">
              <button 
                onClick={() => setSelectedTemplate(null)}
                className="p-1 hover:bg-[#f3f4f6] rounded-md transition-colors mr-2 text-[#24292f]"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-[14px] font-semibold text-[#24292f]">
                Create new issue in EXPNUNI/enuspaceMeta-issues: {selectedTemplate.name}
              </h2>
            </div>
            <div className="flex items-center space-x-2 text-[#57606a]">
              <button className="p-1.5 hover:bg-[#f3f4f6] rounded-md transition-colors focus:outline-none">
                <Maximize2 className="w-4 h-4 opacity-80" />
              </button>
              <button 
                className="p-1.5 hover:bg-[#f3f4f6] rounded-md transition-colors focus:outline-none"
                onClick={onClose}
              >
                <X className="w-4.5 h-4.5 opacity-80" />
              </button>
            </div>
          </div>

          {/* Form Body Scrollable Area */}
          <div className="flex flex-col flex-1 overflow-y-auto px-6 py-5 bg-white w-full items-center">
            
            <div className="w-full max-w-200 flex flex-col space-y-6">
              
              {/* Title Input */}
              <div className="flex flex-col">
                <label className="text-[14px] font-semibold text-[#24292f] mb-2 flex items-center">
                  Add a title <span className="text-[#d83b4b] ml-1">*</span>
                </label>
                <input 
                  type="text" 
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#d0d7de] rounded-md bg-white focus:bg-white focus:ring-2 focus:ring-[#0969da] focus:border-transparent text-[14px] outline-none"
                />
              </div>

              {/* Dynamic Body Inputs (from YAML) */}
              {selectedTemplate.body && selectedTemplate.body.map((field, idx) => {
                if (!field.attributes) return null;
                const { label, description, placeholder } = field.attributes;
                const required = field.validations?.required;

                return (
                  <div key={field.id || idx} className="flex flex-col">
                    <label className="text-[14px] font-semibold text-[#24292f] mb-1.5 flex items-center">
                      {label} {required && <span className="text-[#d83b4b] ml-1">*</span>}
                    </label>
                    {description && (
                      <span className="text-[13px] text-[#57606a] mb-3">
                        {description}
                      </span>
                    )}

                    {field.type === 'textarea' ? (
                      <MarkdownEditor 
                        id={field.id}
                        placeholder={placeholder}
                        value={issueBodies[field.id] || ''}
                        onChange={(val) => handleBodyChange(field.id, val)}
                      />
                    ) : (
                      // Fallback for other GitHub input types (input, dropdowns)
                      <textarea 
                        className="w-full min-h-15 px-3 py-2 border border-[#d0d7de] rounded-md bg-white focus:bg-white focus:ring-2 focus:ring-[#0969da] outline-none text-[14px]"
                        placeholder={placeholder}
                        value={issueBodies[field.id] || ''}
                        onChange={(e) => handleBodyChange(field.id, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}

              {/* Labels Indicator */}
              {selectedTemplate.labels && selectedTemplate.labels.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-[#d0d7de] w-full">
                  {selectedTemplate.labels.map(lbl => (
                    <span 
                      key={lbl} 
                      className="px-2.5 py-0.5 text-[12px] font-medium rounded-full bg-white text-[#57606a] border border-[#d0d7de] flex items-center shadow-sm"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#d83b4b] mr-1.5"></span>
                      {lbl}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
          </div>

          {/* Form Footer */}
          <div className="px-6 py-4 border-t border-[#d0d7de] bg-white shrink-0 flex items-center justify-end rounded-b-xl gap-4">
            
            <Button 
              variant="outline" 
              className="text-[#24292f] border-[#d0d7de] bg-white hover:bg-[#f3f4f6]"
              onClick={() => {
                setSelectedTemplate(null);
               
              }}
            >
              Cancel
            </Button>
            
            <div className="flex bg-[#1f883d] rounded-md overflow-hidden">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-[#1a7f37] hover:text-white rounded-none px-4 font-semibold border-r border-[#1a7f37]/30"
                onClick={handleCreate}
                disabled={createIssueMutation.isPending || !issueTitle.trim()}
              >
                {createIssueMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
