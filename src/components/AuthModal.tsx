import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../firebase';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export function AuthModal() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err: any) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setErrorMsg('Este e-mail já está cadastrado.');
          break;
        case 'auth/invalid-email':
          setErrorMsg('Formato de e-mail inválido.');
          break;
        case 'auth/weak-password':
          setErrorMsg('A senha precisa ter no mínimo 6 caracteres.');
          break;
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          setErrorMsg('E-mail ou senha incorretos.');
          break;
        default:
          setErrorMsg('Ocorreu um erro ao autenticar. Tente novamente.');
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#eef1f6]/90 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-[32px] bg-white p-6 sm:p-8 shadow-2xl border border-slate-200/80 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Logo / Título */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-16 w-16 rounded-[22px] bg-[#ccf638] flex items-center justify-center text-slate-950 font-black text-2xl shadow-sm mb-3">
            $
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {isRegistering ? 'Criar sua Conta' : 'Acesse suas Finanças'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRegistering 
              ? 'Cadastre seu e-mail para salvar e sincronizar seus gastos' 
              : 'Entre com suas credenciais para acessar seus dados'}
          </p>
        </div>

        {/* Mensagem de Erro */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200/60 p-3 text-xs font-semibold text-rose-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">E-mail</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl bg-[#f8f9fb] border border-slate-200 pl-11 pr-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Senha</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Mínimo de 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl bg-[#f8f9fb] border border-slate-200 pl-11 pr-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#141f18] py-3.5 text-xs font-bold text-white hover:bg-slate-900 active:scale-[0.99] transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Aguarde...' : isRegistering ? 'Cadastrar e Entrar' : 'Entrar'}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        {/* Alternar Cadastro / Login */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMsg('');
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer"
          >
            {isRegistering ? (
              <span>Já tem uma conta? <b className="text-slate-900 underline">Fazer Login</b></span>
            ) : (
              <span>Não tem conta? <b className="text-slate-900 underline">Cadastre-se gratuitamente</b></span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}