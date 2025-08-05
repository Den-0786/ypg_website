/* eslint-disable import/no-anonymous-default-export */

const defaultTitle = "Presbyterian Youth | YPG";
const defaultDescription = "The official website of the Presbyterian Youth Fellowship. Stay informed, join events, and grow in Christ.";

const siteUrl = "https://your-site-url.com"; //  actual domain goes here

export default {
    title: defaultTitle,
    description: defaultDescription,
    canonical: siteUrl,
    openGraph: {
        type: "website",
        locale: "en_GH",
        url: siteUrl,
        site_name: defaultTitle,
        title: defaultTitle,
        description: defaultDescription,
        images: [
        {
            url: `${siteUrl}/logo/ypg.jpeg`,
            width: 800,
            height: 600,
            alt: "YPG Logo",
            type: "image/jpeg",
        },
        ],
    },
    twitter: {
        handle: "@ypg_official", 
        site: "@ypg_official",
        cardType: "summary_large_image",
    },
};
