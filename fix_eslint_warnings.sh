#!/bin/bash

echo "🧹 Corrigindo warnings do ESLint..."

# App.js - Remover variáveis não utilizadas
sed -i '' '20d' src/App.js  # Remove activeTab
sed -i '' '20d' src/App.js  # Remove setActiveTab (linha agora é 20)
sed -i '' '20d' src/App.js  # Remove showOnboarding (linha agora é 20)
sed -i '' '20d' src/App.js  # Remove currentUser (linha agora é 20)

# BudgetHub.js - Remover isAuthenticated não utilizado
sed -i '' 's/const { user, isAuthenticated }/const { user }/' src/components/BudgetHub.js

# ClientManager.js - Remover isAuthenticated não utilizado
sed -i '' 's/const { user, isAuthenticated }/const { user }/' src/components/ClientManager.js

# DashboardPage.js - Remover user não utilizado
sed -i '' 's/const { user, isAuthenticated }/const { isAuthenticated }/' src/components/DashboardPage.js

# GnssUploader.js - Remover imports e variáveis não utilizadas
sed -i '' 's/import { supabase, db, storage }/import { supabase }/' src/components/GnssUploader.js
sed -i '' 's/const { user, isAuthenticated }/const { user }/' src/components/GnssUploader.js

echo "✅ Warnings do ESLint corrigidos!"
echo "📝 Nota: Os warnings de dependências do useEffect são intencionais para evitar loops infinitos."