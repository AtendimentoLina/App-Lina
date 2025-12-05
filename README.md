# Lina Design Mobile App Project

Este projeto é um aplicativo mobile de alta fidelidade desenvolvido em React, projetado para a Loja Integrada. Ele utiliza uma arquitetura **Headless PWA**, adequada para compilação em Android (.apk) e iOS (.ipa) usando **Capacitor**.

## 🚀 1. Configuração e Instalação

Para rodar localmente:
1. Certifique-se de ter o Node.js instalado.
2. Execute `npm install`.
3. Execute `npm start`.

## 🛒 2. Integração Oficial com Loja Integrada (Obrigatório)

Como a Loja Integrada não permite hospedar APIs backend dentro do painel dela, você deve usar a **Vercel** (gratuita) para servir como ponte segura.

### Passo 1: Criar o arquivo da API
Crie uma pasta chamada `api` na raiz do seu projeto e dentro dela um arquivo `products.js`. Cole o seguinte código:

```javascript
// Arquivo: api/products.js
const axios = require('axios');

export default async function handler(req, res) {
  // Configure sua Chave API nas Variáveis de Ambiente da Vercel como LI_API_KEY
  const API_KEY = process.env.LI_API_KEY; 
  
  if (!API_KEY) {
    return res.status(500).json({ error: 'Chave de API não configurada.' });
  }

  try {
    // Busca produtos na Loja Integrada
    const response = await axios.get('https://api.awsli.com.br/v1/produto', {
      headers: { 'Authorization': `chave_api ${API_KEY}` },
      params: { limit: 20, format: 'json' }
    });

    // Formata para o App Lina Design
    const products = response.data.objects.map(item => ({
      id: item.id.toString(),
      name: item.nome,
      price: parseFloat(item.preco_venda),
      oldPrice: item.preco_cheio ? parseFloat(item.preco_cheio) : null,
      image: item.imagem_principal?.grande || '',
      category: item.categorias?.[0]?.nome || 'Geral',
      description: item.descricao_completa || item.nome,
      rating: 5.0 // Valor padrão pois a API pública não retorna reviews
    }));

    // Configura Cache (opcional) e CORS
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar produtos na Loja Integrada' });
  }
}
```

### Passo 2: Configurar na Vercel
1. Suba este projeto para o GitHub.
2. Conecte o GitHub na [Vercel](https://vercel.com).
3. Nas configurações do projeto na Vercel, vá em **Settings > Environment Variables**.
4. Adicione uma variável chamada `LI_API_KEY` com a chave que você gerou no painel da Loja Integrada.

### Passo 3: Atualizar o App
No arquivo `App.tsx`, altere a variável `API_BASE_URL` para o endereço do seu site na Vercel (ex: `https://lina-design.vercel.app/api`).

---

## 📱 3. Como Compilar para Android e iOS

Recomendamos usar o **Capacitor JS**.

### Pré-requisitos
- Android Studio (para Android)
- Xcode (para iOS - apenas Mac)

### Comandos
1. **Instalar Capacitor:**
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
   npx cap init "Lina Design" com.lina.app
   ```

2. **Gerar Build Web:**
   ```bash
   npm run build
   ```

3. **Sincronizar e Abrir:**
   ```bash
   npx cap add android
   npx cap sync
   npx cap open android
   ```

4. **Publicar:**
   - No Android Studio: `Build > Generate Signed Bundle / APK`.

## 🎨 4. Customização

- **Cores:** Edite `tailwind.config` no arquivo `index.html`.
- **Logos/Ícones:** Substitua os arquivos na pasta `/public` ou atualize as URLs em `constants.ts`.
