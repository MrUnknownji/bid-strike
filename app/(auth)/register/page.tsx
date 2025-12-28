import Link from 'next/link';
import RegisterForm from '@/components/forms/RegisterForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function RegisterPage() {
    return (
        <div className="min-h-[600px] flex items-center justify-center py-12 px-4 bg-gradient-to-b from-muted/30 via-transparent to-transparent">
            <Card className="max-w-md w-full border-border/50">
                <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl tracking-tight">Create Account</CardTitle>
                    <CardDescription className="text-sm">Join BidStrike today</CardDescription>
                </CardHeader>
                <CardContent>
                    <RegisterForm />

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline underline-offset-4">
                            Sign in
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

