import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useVerifyEmail } from "@/hooks/use-verify-email";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AxiosError } from "axios";

interface ErrorResponse {
    message: string;
}

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const { mutate, isPending, isSuccess, isError, error } = useVerifyEmail();
    const verificationSent = useRef(false);
    const [verificationState, setVerificationState] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (token && !verificationSent.current) {
            verificationSent.current = true;
            setVerificationState('verifying');
            mutate({ token });
        }
    }, [token, mutate]);

    useEffect(() => {
        if (isSuccess) {
            setVerificationState('success');
        } else if (isError) {
            setVerificationState('error');
        }
    }, [isSuccess, isError]);

    const renderContent = () => {
        switch (verificationState) {
            case 'success':
                return (
                    <div>
                        <p className="text-green-600 mb-4">Email verified successfully! Redirecting to login...</p>
                        <Button asChild>
                            <Link to="/login">Proceed to Login</Link>
                        </Button>
                    </div>
                );
            case 'error':
                return (
                    <div>
                        <p className="text-red-600 mb-4">
                            {(error as AxiosError<ErrorResponse>)?.response?.data?.message || "Failed to verify email. The link may have expired."}
                        </p>
                        <Button asChild>
                            <Link to="/login">Back to Login</Link>
                        </Button>
                    </div>
                );
            case 'verifying':
                return (
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p>Verifying your email address...</p>
                    </div>
                );
            default:
                if (!token) {
                    return (
                        <div>
                            <p className="text-red-600 mb-4">No verification token found. Please return to the login page.</p>
                            <Button asChild>
                                <Link to="/login">Back to Login</Link>
                            </Button>
                        </div>
                    );
                }
                return null;
        }
    };

    return (
        <section className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-950">
            <Card className="w-full max-w-md shadow-lg text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">Email Verification</CardTitle>
                    <CardDescription>
                        {verificationState === 'verifying' 
                            ? 'Please wait a moment while we confirm your email address.'
                            : 'Email verification status'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {renderContent()}
                </CardContent>
            </Card>
        </section>
    );
} 