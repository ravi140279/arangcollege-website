import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/page-renderer";
import { allPageSlugs, pages } from "@/lib/site-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return allPageSlugs.map((slug) => ({ slug }));
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;
  const page = pages[slug];

  if (!page) {
    notFound();
  }

  return <PageRenderer page={page} />;
}
