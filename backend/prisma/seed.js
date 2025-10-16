// backend/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Dados dos módulos e aulas do curso (VERSÃO COMPLETA)
const modulosData = [
  {
    titulo: 'Módulo 1 – Segredos das Plantas Medicinais',
    descricao: 'Descubra o poder das ervas, desde a identificação até o cultivo seguro.',
    imagemUrl: '/img/md1.jpg',
    aulas: [
      { titulo: 'Descobrindo o poder das ervas: identifique e conheça suas propriedades', videoUrl: 'https://fast.wistia.net/embed/iframe/qug4mwlyn6' },
      { titulo: 'Cultive e preserve suas próprias plantas medicinais em casa', videoUrl: 'https://fast.wistia.net/embed/iframe/qug4mwlyn6' },
      { titulo: 'Ervas em chás fitoterápicos', videoUrl: 'https://fast.wistia.net/embed/iframe/qug4mwlyn6' },
    ],
  },
  {
    titulo: 'Módulo 2 – Tinturas Mágicas: Extraia o Poder das Ervas',
    descricao: 'Aprenda a criar tinturas potentes para o seu bem-estar diário.',
    imagemUrl: '/img/md2.jpg',
    aulas: [
      { titulo: 'Tinturas: o que são e por que transformar suas ervas', videoUrl: 'https://fast.wistia.net/embed/iframe/qug4mwlyn6' },
      { titulo: 'Passo a passo: Tintura de ervas medicinais', videoUrl: 'https://fast.wistia.net/embed/iframe/78xlx6fjop' },
      { titulo: 'Receitas poderosas de tinturas para o dia a dia', videoUrl: 'https://fast.wistia.net/embed/iframe/qug4mwlyn6' },
    ],
  },
  {
    titulo: 'Módulo 3 – Pomadas Naturais que Curam',
    descricao: 'Transforme ingredientes naturais em pomadas para cicatrização e relaxamento.',
    imagemUrl: '/img/md3.jpg',
    aulas: [
      { titulo: 'Fazendo óleo medicinal com ervas', videoUrl: 'https://fast.wistia.net/embed/iframe/c2g2o918i7' },
      { titulo: 'Extraindo propriedades medicinais para aplicação direta', videoUrl: 'https://fast.wistia.net/embed/iframe/qug4mwlyn6' },
      { titulo: 'Pomadas práticas: Vela de óleo medicinal', videoUrl: 'https://fast.wistia.net/embed/iframe/ye7c3ffs9p' },
    ],
  },
  {
    titulo: 'Módulo 4 – Cascas de Frutas: Tesouros Desperdiçados',
    descricao: 'Aprenda a transformar cascas de frutas em poderosos remédios naturais.',
    imagemUrl: '/img/md4.jpg',
    aulas: [
      { titulo: 'Descubra quais cascas podem virar remédios naturais', videoUrl: 'https://fast.wistia.net/embed/iframe/qug4mwlyn6' },
      { titulo: 'Como secar, conservar e armazenar para uso fitoterápico', videoUrl: 'https://fast.wistia.net/embed/iframe/qug4mwlyn6' },
      { titulo: 'Transforme cascas em infusões e xaropes que curam', videoUrl: 'https://fast.wistia.net/embed/iframe/e5n4d46exq' },
    ],
  },
  {
    titulo: 'Módulo 5 – Cascas de Vegetais: Poder Oculto',
    descricao: 'Desvende as propriedades medicinais das cascas que você joga fora.',
    imagemUrl: '/img/md5.jpg',
    aulas: [
      { titulo: 'Propriedades medicinais das cascas que você joga fora', videoUrl: 'https://fast.wistia.net/embed/iframe/qug4mwlyn6' },
      { titulo: 'Técnicas de desidratação e preparo eficazes', videoUrl: 'https://fast.wistia.net/embed/iframe/qug4mwlyn6' },
      { titulo: 'Receitas de tinturas e xaropes que potencializam a saúde', videoUrl: 'https://fast.wistia.net/embed/iframe/qug4mwlyn6' },
    ],
  },
  {
    titulo: 'Módulo 6 – Fitoterapia Avançada: Combinações Inteligentes',
    descricao: 'Crie suas próprias fórmulas personalizadas para resultados máximos.',
    imagemUrl: '/img/md6.jpg',
    aulas: [
      { titulo: 'Como combinar ervas: Cataplasma com erva medicinal', videoUrl: 'https://fast.wistia.net/embed/iframe/kju2fcxklc' },
      { titulo: 'Crie suas próprias receitas: Méis de ervas medicinais', videoUrl: 'https://fast.wistia.net/embed/iframe/edzc1q22uv' },
      { titulo: 'Dosagem, preservação e cuidados para resultados duradouros', videoUrl: 'https://fast.wistia.net/embed/iframe/qug4mwlyn6' },
    ],
  },
];

async function main() {
  console.log('A iniciar o processo de seeding...');
  await prisma.progressoAula.deleteMany({});
  await prisma.aula.deleteMany({});
  await prisma.modulo.deleteMany({});
  console.log('Dados antigos eliminados.');

  for (const moduloData of modulosData) {
    await prisma.modulo.create({
      data: {
        titulo: moduloData.titulo,
        descricao: moduloData.descricao,
        imagemUrl: moduloData.imagemUrl,
        aulas: {
          create: moduloData.aulas.map(aula => ({
            titulo: aula.titulo,
            descricao: '', // Descrição da aula pode ser adicionada depois se necessário
            videoUrl: aula.videoUrl,
          })),
        },
      },
    });
    console.log(`Módulo '${moduloData.titulo}' criado.`);
  }

  await prisma.modulo.create({
    data: {
      titulo: 'Emissão de Certificado',
      descricao: 'Parabéns! Emita o seu certificado de conclusão.',
      imagemUrl: '/img/md7.jpg',
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