// backend/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Dados dos módulos e aulas do curso
const modulosData = [
  {
    titulo: 'Módulo 1 – Segredos das Plantas Medicinais',
    descricao: 'Descubra o poder das ervas, desde a identificação até o cultivo seguro.',
    aulas: [
      { titulo: 'Descobrindo o poder das ervas: identifique e conheça suas propriedades', videoUrl: 'https://descobrindo-o-poder-das--xrh9gpa.gamma.site/' },
      { titulo: 'Cultive e preserve suas próprias plantas medicinais em casa', videoUrl: 'https://seu-jardim-de-cura--dmq9aik.gamma.site/' },
      { titulo: 'Ervas em chás fitoterápicos', videoUrl: 'https://fast.wistia.net/embed/iframe/qug4mwlyn6?web_component=true&seo=true' },
    ],
  },
  {
    titulo: 'Módulo 2 – Tinturas Mágicas: Extraia o Poder das Ervas',
    descricao: 'Aprenda a criar tinturas potentes para o seu bem-estar diário.',
    aulas: [
      { titulo: 'Tinturas: o que são e por que transformar suas ervas', videoUrl: 'https://tinturas-a-arte-de-extra-8kot30h.gamma.site/' },
      { titulo: 'Passo a passo: Tintura de ervas medicinais', videoUrl: 'https://fast.wistia.net/embed/iframe/78xlx6fjop?web_component=true&seo=true' },
      { titulo: 'Receitas poderosas de tinturas para o dia a dia', videoUrl: 'https://minha-farmacia-natural-5h7ustr.gamma.site/' },
    ],
  },
  {
    titulo: 'Módulo 3 – Pomadas Naturais que Curam',
    descricao: 'Transforme ingredientes naturais em pomadas para cicatrização e relaxamento.',
    aulas: [
      { titulo: 'Fazendo óleo medicinal com ervas', videoUrl: 'https://fast.wistia.net/embed/iframe/c2g2o918i7?web_component=true&seo=true' },
      { titulo: 'Extraindo propriedades medicinais para aplicação direta', videoUrl: 'https://o-toque-que-cura-yh9llta.gamma.site/' },
      { titulo: 'Pomadas práticas: Vela de óleo medicinal', videoUrl: 'https://fast.wistia.net/embed/iframe/ye7c3ffs9p?web_component=true&seo=true' },
    ],
  },
  {
    titulo: 'Módulo 4 – Cascas de Frutas: Tesouros Desperdiçados',
    descricao: 'Aprenda a transformar cascas de frutas em poderosos remédios naturais.',
    aulas: [
      { titulo: 'Descubra quais cascas podem virar remédios naturais', videoUrl: 'https://o-tesouro-na-casca-md753ks.gamma.site/' },
      { titulo: 'Como secar, conservar e armazenar para uso fitoterápico', videoUrl: 'https://guia-completo-de-secagem-kl9b6o8.gamma.site/' },
      { titulo: 'Transforme cascas em infusões e xaropes que curam', videoUrl: 'https://fast.wistia.net/embed/iframe/e5n4d46exq?web_component=true&seo=true' },
    ],
  },
  {
    titulo: 'Módulo 5 – Cascas de Vegetais: Poder Oculto',
    descricao: 'Desvende as propriedades medicinais das cascas que você joga fora.',
    aulas: [
      { titulo: 'Propriedades medicinais das cascas que você joga fora', videoUrl: 'https://a-farmacia-que-voce-joga-acg4bcc.gamma.site/' },
      { titulo: 'Técnicas de desidratação e preparo eficazes', videoUrl: 'https://a-arte-de-preservar-a-na-t9omvpg.gamma.site/' },
      { titulo: 'Receitas de tinturas e xaropes que potencializam a saúde', videoUrl: 'https://elixires-da-natureza-4q0ooaf.gamma.site/' },
    ],
  },
  {
    titulo: 'Módulo 6 – Fitoterapia Avançada: Combinações Inteligentes',
    descricao: 'Crie suas próprias fórmulas personalizadas para resultados máximos.',
    aulas: [
      { titulo: 'Como combinar ervas: Cataplasma com erva medicinal', videoUrl: 'https://fast.wistia.net/embed/iframe/kju2fcxklc?web_component=true&seo=true' },
      { titulo: 'Crie suas próprias receitas: Méis de ervas medicinais', videoUrl: 'https://fast.wistia.net/embed/iframe/edzc1q22uv?web_component=true&seo=true' },
      { titulo: 'Dosagem, preservação e cuidados para resultados duradouros', videoUrl: 'https://a-medida-da-natureza-aura6ot.gamma.site/' },
    ],
  },
];

async function main() {
  console.log('A iniciar o processo de seeding...');
  // Limpa as tabelas na ordem correta para evitar erros de chave estrangeira
  await prisma.progressoAula.deleteMany({});
  await prisma.aula.deleteMany({});
  await prisma.modulo.deleteMany({});
  console.log('Dados antigos eliminados.');

  // Cria os módulos do curso com suas respectivas aulas
  for (const moduloData of modulosData) {
    await prisma.modulo.create({
      data: {
        titulo: moduloData.titulo, // Corrigido de 'title' para 'titulo'
        descricao: moduloData.descricao, // Corrigido de 'description' para 'descricao'
        aulas: {
          create: moduloData.aulas.map(aula => ({
            titulo: aula.titulo, // Corrigido de 'title' para 'titulo'
            descricao: '', // Adicionado campo 'descricao' obrigatório para a aula
            videoUrl: aula.videoUrl, // Corrigido de 'contentUrl' para 'videoUrl'
          })),
        },
      },
    });
    console.log(`Módulo '${moduloData.titulo}' criado.`);
  }

  // Cria o módulo especial para o certificado, sem aulas associadas
  await prisma.modulo.create({
    data: {
      titulo: 'Emissão de Certificado', // Corrigido de 'title' para 'titulo'
      descricao: 'Parabéns! Emita o seu certificado de conclusão.', // Corrigido de 'description' para 'descricao'
    },
  });
  console.log('Módulo de Emissão de Certificado criado.');

  console.log('Seeding concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Ocorreu um erro durante o seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });