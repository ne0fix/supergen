import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { mockCategorias, mockProdutos } from '../src/mocks/produtos.mock';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const adminPassword = process.env.ADMIN_SENHA_SEED;
  const adminEmail = process.env.ADMIN_EMAIL_SEED;

  if (!adminPassword || !adminEmail) {
    throw new Error('ADMIN_SENHA_SEED and ADMIN_EMAIL_SEED must be defined in .env');
  }
  const hashedPassword = await hash(adminPassword, 12);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      senhaHash: hashedPassword,
    },
    create: {
      email: adminEmail,
      nome: 'Admin',
      senhaHash: hashedPassword,
    },
  });
  console.log('Admin user created/updated.');

  for (const categoria of mockCategorias) {
    await prisma.categoria.upsert({
      where: { id: categoria.id },
      update: { nome: categoria.nome, icone: categoria.icone },
      create: {
        id: categoria.id,
        nome: categoria.nome,
        icone: categoria.icone,
      },
    });
  }
  console.log('Categories created/updated.');

  const tags = ['desconto', 'fresco', 'organico', 'sem-gluten', 'sem-lactose'];
  for (const tagLabel of tags) {
    await prisma.tag.upsert({
      where: { id: tagLabel },
      update: {},
      create: { id: tagLabel, label: tagLabel },
    });
  }
  console.log('Tags created/updated.');

  for (const produto of mockProdutos) {
    const productData = {
        nome: produto.nome,
        descricao: produto.descricao,
        preco: produto.preco,
        precoOriginal: produto.precoOriginal,
        imagem: produto.imagem,
        quantidadePacote: produto.quantidadePacote,
        emEstoque: produto.emEstoque,
        avaliacao: produto.avaliacao,
        numAvaliacoes: produto.numAvaliacoes,
        categoriaId: produto.categoria,
    };

    // Using a non-atomic upsert logic because `nome` is not a unique field in the schema
    const existingProduct = await prisma.produto.findFirst({
        where: { nome: productData.nome },
    });

    let upsertedProduto;
    if (existingProduct) {
        upsertedProduto = await prisma.produto.update({
            where: { id: existingProduct.id },
            data: productData,
        });
    } else {
        upsertedProduto = await prisma.produto.create({
            data: productData,
        });
    }


    if (produto.tags && produto.tags.length > 0) {
        await prisma.produtoTag.deleteMany({
            where: { produtoId: upsertedProduto.id }
        });
        
      for (const tagLabel of produto.tags) {
        const tag = await prisma.tag.findUnique({ where: { id: tagLabel } });
        if (tag) {
          await prisma.produtoTag.create({
            data: {
              produtoId: upsertedProduto.id,
              tagId: tag.id,
            },
          });
        }
      }
    }
  }
  console.log(`Products and product-tags for ${mockProdutos.length} products created/updated.`);

  await prisma.secao.upsert({
    where: { slug: 'ofertas-do-dia' },
    update: {},
    create: {
      slug: 'ofertas-do-dia',
      titulo: '🔥 Ofertas do Dia',
      subtitulo: 'Aproveite as melhores ofertas de hoje',
      ordem: 0,
      modoSelecao: 'AUTOMATICO',
      filtroTag: 'desconto',
      maxItens: 8,
    },
  });

  await prisma.secao.upsert({
    where: { slug: 'frios-embutidos' },
    update: {},
    create: {
      slug: 'frios-embutidos',
      titulo: '🧀 Frios e Embutidos',
      subtitulo: 'Frango, salsicha, linguiça e mais',
      ordem: 1,
      modoSelecao: 'AUTOMATICO',
      filtroCategoriaId: 'frios-e-embutidos',
      maxItens: 8,
    },
  });
  console.log('Home sections created/updated.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
