import Link from "next/link";
import { FileText, File, Image, Scissors, Type, Minus, RefreshCw, Zap, Shield, Lock } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface ToolSEOSectionProps {
  toolName: string;
  toolDescription: string;
  howToSteps: string[];
  faq: FAQItem[];
  tips: string[];
  relatedTools: { name: string; path: string; description: string }[];
  iconColor?: string;
}

const toolIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Merge PDF": FileText,
  "Split PDF": Scissors,
  "PDF to Word": File,
  "Word to PDF": FileText,
  "Compress PDF": Minus,
  "Image to PDF": Image,
  "Image to Text": Type,
  "PDF to Text": File,
  "Rearrange PDF": RefreshCw,
};

export default function ToolSEOSection({
  toolName,
  toolDescription,
  howToSteps,
  faq,
  tips,
  relatedTools,
  iconColor = "text-blue-600",
}: ToolSEOSectionProps) {
  const ToolIcon = toolIcons[toolName] || FileText;

  return (
    <>
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{toolName} — Complete Guide</h2>
          <p className="text-gray-700 leading-relaxed mb-6 text-lg">
            {toolDescription}
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">
            Whether you're a student, professional, or business user, our {toolName.toLowerCase()} tool makes it easy to handle your documents quickly and securely. All processing happens directly in your browser — your files never leave your device.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-10">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-600" />
              Why Choose Our {toolName} Tool?
            </h3>
            <ul className="space-y-3 text-blue-800">
              <li className="flex items-start">
                <span className="mr-2 text-blue-500">✓</span>
                <span><strong>100% private</strong> — Files are processed entirely in your browser</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-500">✓</span>
                <span><strong>Free with no limits</strong> — No watermarks, no registration, no file size caps</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-500">✓</span>
                <span><strong>Professional results</strong> — Preserves formatting, layout, and quality</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-500">✓</span>
                <span><strong>Instant processing</strong> — Get results in seconds, not minutes</span>
              </li>
            </ul>
          </div>

          <div className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 mb-6">How to Use {toolName}</h3>
            <div className="space-y-4">
              {howToSteps.map((step, index) => (
                <div key={index} className="flex items-start bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 mr-4">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {faq.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">{item.question}</h4>
                  <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="mb-10 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Best Results</h3>
            <ul className="space-y-3 text-gray-700">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Related Tools */}
          {relatedTools.length > 0 && (
            <div className="mb-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Related Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedTools.map((tool, index) => (
                  <Link
                    key={index}
                    href={tool.path}
                    className="block p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all bg-white"
                  >
                    <div className="flex items-center mb-3">
                      <ToolIcon className={`w-5 h-5 ${iconColor} mr-2`} />
                      <h4 className="font-semibold text-gray-900">{tool.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{tool.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Security Note */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              Security & Privacy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-green-800">
              <div className="flex items-start">
                <Lock className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm"><strong>Zero data transmission</strong> — Files never leave your device</span>
              </div>
              <div className="flex items-start">
                <Shield className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm"><strong>Automatic cleanup</strong> — Temporary data is deleted instantly</span>
              </div>
              <div className="flex items-start">
                <Lock className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm"><strong>HTTPS encrypted</strong> — Secure page delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
