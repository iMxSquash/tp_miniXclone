import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connect from '../../../../libs/mongodb';
import User from '../../../../models/user.model';

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        // Vérifier si l'utilisateur existe
        await connect();
        const user = await User.findOne({ email });

        if (!user) {
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 400 });
        }

        // Comparer le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 400 });
        }

        // Générer un token JWT
        const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Retourner le token JWT à l'utilisateur
        return new Response(JSON.stringify({ token }), { status: 200 });
    }
    catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
