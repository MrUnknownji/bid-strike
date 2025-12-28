import { Card, CardContent } from "@/components/ui/card";
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: December 28, 2024</p>

            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0 space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We collect information you provide directly to us, such as when you create an account, update your profile, place a bid, or communicate with us.
                            This may include your name, email address, postal address, phone number, and payment information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>To provide, maintain, and improve our services.</li>
                            <li>To process transactions and send related information, including confirmations and invoices.</li>
                            <li>To send you technical notices, updates, security alerts, and support messages.</li>
                            <li>To detect and prevent fraudulent transactions and other illegal activities.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">3. Info Sharing</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We do not sell your personal information. We may share your information with third-party service providers
                            who need access to such information to carry out work on our behalf (e.g., payment processors, hosting services).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">4. Security</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">5. Cookies</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We use cookies to collect information about your activity on our services.
                            You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies.
                        </p>
                    </section>
                </CardContent>
            </Card>

            <div className="mt-12 pt-8 border-t">
                <p className="text-center text-muted-foreground text-sm">
                    Concerns about your privacy? <Link href="/contact" className="text-primary hover:underline">Contact Us</Link>
                </p>
            </div>
        </div>
    );
}
