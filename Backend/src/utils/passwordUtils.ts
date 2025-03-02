import bcrypt from 'bcrypt';

// Hash password
const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

// Compare password with hash
const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};

export { hashPassword, comparePassword };
