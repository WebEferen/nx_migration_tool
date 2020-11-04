import url from 'url'; // this import has to be before any other

// Workaround for url encoding
const orygParse = url.parse;
(url as any).parse = (url: string) => {
    const parsed = orygParse(url);
    parsed.path = url.slice(url.indexOf(parsed.host) + parsed.host.length);

    return parsed;
};
