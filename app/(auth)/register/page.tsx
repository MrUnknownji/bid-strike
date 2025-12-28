import Link from 'next/link';
import RegisterForm from '@/components/forms/RegisterForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function RegisterPage() {
    return (
        <div className="min-h-[600px] flex items-center justify-center py-12 px-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Create Account</CardTitle>
                    <CardDescription>Join BidStrike today</CardDescription>
                </CardHeader>
                <CardContent>
                    <RegisterForm />

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
