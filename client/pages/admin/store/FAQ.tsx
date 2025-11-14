import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export default function StoreFAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>([
    { id: 1, question: "كيف يمكنني تتبع طلبي؟", answer: "يمكنك تتبع طلبك من خلال رقم الطلب المرسل إليك عبر البريد الإلكتروني" },
    { id: 2, question: "ما هي طرق الدفع المتاحة؟", answer: "نقبل الدفع عند الاستلام، البطاقات الائتمانية، والتحويل البنكي" },
  ]);

  const addFAQ = () => {
    const newFAQ: FAQItem = {
      id: Date.now(),
      question: "",
      answer: ""
    };
    setFaqs([...faqs, newFAQ]);
  };

  const removeFAQ = (id: number) => {
    setFaqs(faqs.filter(faq => faq.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            الأسئلة الشائعة
          </h1>
          <p className="text-muted-foreground mt-2">أضف الأسئلة الشائعة وإجاباتها</p>
        </div>
        <Button onClick={addFAQ} className="bg-gradient-to-r from-primary to-accent">
          <Plus className="w-4 h-4 ml-2" />
          إضافة سؤال
        </Button>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card key={faq.id} className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <span>السؤال {index + 1}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFAQ(faq.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">السؤال</label>
                <Input
                  placeholder="اكتب السؤال هنا..."
                  defaultValue={faq.question}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">الإجابة</label>
                <Textarea
                  placeholder="اكتب الإجابة هنا..."
                  rows={3}
                  defaultValue={faq.answer}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {faqs.length === 0 && (
        <Card className="border-2 border-dashed border-primary/30">
          <CardContent className="py-12 text-center">
            <HelpCircle className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-4">لا توجد أسئلة شائعة بعد</p>
            <Button onClick={addFAQ} className="bg-gradient-to-r from-primary to-accent">
              <Plus className="w-4 h-4 ml-2" />
              إضافة أول سؤال
            </Button>
          </CardContent>
        </Card>
      )}

      <Button className="w-full bg-gradient-to-r from-primary to-accent">
        حفظ الأسئلة الشائعة
      </Button>
    </div>
  );
}
