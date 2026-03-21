interface LoginLayoutProps {
  children: React.ReactNode;
}

export const LoginLayout: React.FC<LoginLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-xl mb-4">
            P
          </div>
          <h1 className="text-xl font-bold text-gray-900">Primus EHR</h1>
          <p className="text-sm text-gray-400 mt-1">Provider Portal</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
