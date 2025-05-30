import { http, createConfig } from "wagmi";
import { storyAeneid, storyTestnet, story } from "wagmi/chains";

export const config = createConfig({
  chains: [storyAeneid, storyTestnet, story],
  transports: {
    [storyAeneid.id]: http(),
    [storyTestnet.id]: http(),
    [story.id]: http(),
  },
});
