import bcrypt from "bcryptjs";

export const isPasswordCorrect = async ({
  password,
  hash,
}: {
  password: string;
  hash: string;
}) => await bcrypt.compare(password, hash);
