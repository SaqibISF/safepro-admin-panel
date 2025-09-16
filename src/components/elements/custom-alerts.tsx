import React, { FC } from "react";
import { AlertCircleIcon, CheckCircle } from "lucide-react";
import { Alert, AlertTitle } from "../ui/alert";

export const SuccessAlert: FC<{ message?: string }> = ({ message }) =>
  message && (
    <Alert className="text-green-500">
      <CheckCircle />
      <AlertTitle className="line-clamp-none">{message}</AlertTitle>
    </Alert>
  );

export const ErrorAlert: FC<{ message?: string }> = ({ message }) =>
  message && (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle className="line-clamp-none">{message}</AlertTitle>
    </Alert>
  );
