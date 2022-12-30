import { ImageResponse } from "@vercel/og";
import type * as React from "react";

const author = {
  name: "Yours Truly",
  avatarSrc: "https://i.pravatar.cc/256?u=30",
};

type Author = typeof author;

// possible problems: multiple fonts, nesting in `fonts` function, weight

export const config = {
  runtime: "experimental-edge",
};

// Note: `vercel dev` doesn't run `.tsx` endpoints
//        and it can't run @vercel/og because of
//        > Invalid URL: ../vendor/noto-sans-v27-latin-regular.ttf
//        The only way to work with this file is repeatedly pushing and checking
//        the result on Vercel Preview Deployments.

/**
 * TODO:
 * - [x] Use Inter font
 * - [ ] Update all libraries related to Vercel OG
 * - [ ] Grain Overlay
 * - [ ] Random Gradient or an illustration in the background
 * - [ ] Text with the color contrasting with gradient
 * - [ ] Very bold (weight 900) white title on top of the gradient
 * - [ ] White footer avatar of the author, their handle, date and reading time of the post
 * - [ ] Secure the endpoint https://vercel.com/docs/concepts/functions/edge-functions/og-image-examples#encrypting-parameters
 */

const interRegular = fetchFont(
  new URL("../assets/og/Inter-Regular.ttf", import.meta.url)
);
const interBlack = fetchFont(
  new URL("../assets/og/Inter-Black.ttf", import.meta.url)
);

export default async function og(req: Request) {
  try {
    const url = new URL(req.url);

    const post = {
      date: new Date(url.searchParams.get("date") || 0),
      title: url.searchParams.get("title") || "Untitled",
      readingTimeMinutes: Number(url.searchParams.get("readingTime") || 0),
    };

    return new ImageResponse(
      h(
        "div",
        {
          tw: `
            w-full h-full
            font-Inter
            flex flex-col
          `,
        },
        h(Illustration, {}, h(Title, { title: post.title })),
        h(Footer, { author, post })
      ),
      {
        width: 1200,
        height: 600,
        fonts: [
          {
            name: "Inter",
            data: await interRegular,
            weight: 400,
            style: "normal",
          },
          {
            name: "Inter",
            data: await interBlack,
            weight: 900,
            style: "normal",
          },
        ],
      }
    );
  } catch (err: unknown) {
    console.error(err);

    const error = err instanceof Error ? err : new Error(String(err));

    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}

function Illustration({ children }: { children?: React.ReactNode[] }) {
  return h(
    "div",
    {
      tw: `
        flex flex-1 justify-start items-center w-full p-4
        bg-black
      `,
    },
    ...children
  );
}

function Title({ title }: { title: string }) {
  return h(
    "h1",
    {
      tw: `
        text-9xl font-black
        text-white
        leading-none
        tracking-tighter
      `,
    },
    title
  );
}

function Footer({ author, post }: { author: Author; post: Post }) {
  return h(
    "footer",
    {
      tw: `
      h-28 w-full px-4 py-2.5
      bg-white
      text-4xl
      flex flex-row justify-center items-center
    `,
    },
    h("img", {
      width: 92,
      height: 92,
      src: author.avatarSrc,
      tw: `rounded-full`,
    }),
    h("span", { tw: `ml-2` }, author.name),
    h("div", { tw: `flex-1` }),
    h(
      "span",
      {},
      [
        post.date.toLocaleDateString("sv-SE"),
        post.readingTimeMinutes >= 1 && `${post.readingTimeMinutes} min`,
      ]
        .filter(Boolean)
        .join(" · ")
    )
  );
}

function h<T extends React.ElementType<any>>(
  type: T,
  props: React.ComponentPropsWithRef<T>,
  ...children: React.ReactNode[]
) {
  return {
    type,
    key: "key" in props ? props.key : null,
    props: {
      ...props,
      children: children && children.length ? children : props.children,
    },
  };
}

function fetchFont(url: URL) {
  return fetch(url).then((res) => res.arrayBuffer());
}

// async function fonts(): Promise<ImageResponseOptions["fonts"]> {
//   const [regular, black] = await Promise.all(
//     [
//       "../assets/og-image/Inter-Regular.ttf",
//       "../assets/og-image/Inter-Black.ttf",
//     ].map((url) =>
//       fetch(new URL(url, import.meta.url)).then((res) => res.arrayBuffer())
//     )
//   );

//   return [
//     {
//       name: "Inter",
//       data: regular,
//       weight: 400,
//       style: "normal",
//     },
//     {
//       name: "Inter",
//       data: black,
//       weight: 900,
//       style: "normal",
//     },
//   ];
// }

type Post = {
  date: Date;
  title: string;
  readingTimeMinutes: number;
};
