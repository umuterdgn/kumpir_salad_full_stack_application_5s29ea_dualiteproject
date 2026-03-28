import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  schema?: object;
}

export const SEO: React.FC<SEOProps> = ({ title, description, schema }) => {
  return (
    <Helmet>
      <title>{title} | Kumpir Salad</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={`${title} | Kumpir Salad`} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};
