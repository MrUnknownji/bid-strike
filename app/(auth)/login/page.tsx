import Link from 'next/link';
import LoginForm from '@/components/forms/LoginForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LoginPage() {
    return (
        <div className="min-h-[600px] flex items-center justify-center py-12 px-4 bg-gradient-to-b from-muted/30 via-transparent to-transparent">
            <Card className="max-w-md w-full border-border/50">
                <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl tracking-tight">Welcome Back</CardTitle>
                    <CardDescription className="text-sm">Sign in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm />

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-primary hover:underline underline-offset-4">
                            Sign up
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

