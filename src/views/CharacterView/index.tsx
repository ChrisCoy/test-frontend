import MarvelLikeLabel from "@/components/MarvelLikeLabel";
import MyContainer from "@/components/MyContainer";
import { queryClient } from "@/pages/_app";
import { marvelApi } from "@/services/marvelApi";
import { CharactersApiResult } from "@/types/Character";
import { ComicsApiResult } from "@/types/Comic";
import { API_LINKS } from "@/utils/apiLinks";
import { APP_PAGES } from "@/utils/appPages";
import { ArrowCircleLeft } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { tv } from "tailwind-variants";
import HorizontalScrollable from "./components/HorizontalScrollable";

interface CharacterViewProps {
  resultFromApi: CharactersApiResult;
}

export default function CharacterView({ resultFromApi }: CharacterViewProps) {
  const router = useRouter();
  const character = resultFromApi.data.results[0];

  const { data, refetch } = useQuery<ComicsApiResult>({
    queryKey: ["comics", character.id],
    enabled: false,
    queryFn: async () => {
      const { data } = await marvelApi.get<ComicsApiResult>(
        API_LINKS.characterComics(character.id.toString())
      );
      return data;
    },
  });
  const comicsImagesCanRepeat = data?.data.results?.map((comic, _, arr) => {
    if (comic.thumbnail.path.includes("image_not_available")) {
      return "/images/marvel-placeholder.jpg";
    }
    return comic.thumbnail.path + "." + comic.thumbnail.extension;
  });

  const distinctComicsImages =
    comicsImagesCanRepeat?.filter((comic, idx, arr) => {
      return arr.indexOf(comic) === idx;
    }) || [];

  useEffect(() => {
    refetch();
    return () => {
      queryClient.invalidateQueries(["comics", character.id]);
    };
  }, []);

  // how the hell web doesn't have an api to check if can go back?
  function handleGoBack() {
    router.back();
  }

  return (
    <MyContainer>
      <button onClick={handleGoBack} className="hover:scale-110 transition-all">
        <ArrowCircleLeft size={48} className="fill-red-500" />
      </button>
      <div className="flex gap-4 max-md:flex-col">
        <div className="relative aspect-[11/16] max-w-[22rem] w-full overflow-hidden">
          <Image
            src={character.thumbnail.path + "." + character.thumbnail.extension}
            alt={`${character.name}'s photo`}
            fill
            sizes="100vw"
            className="object-cover"
            // onLoadingComplete={() => {
            //   setLoadComplete(true);
            // }}
          />
        </div>
        <div className="flex flex-col py-8">
          <MarvelLikeLabel className="text-7xl max-sm:text-5xl font-bold mt-4">
            {character.name}
          </MarvelLikeLabel>
          <p className="text-black text-2xl font-bold mt-8">
            {character.description}
          </p>

          <p className="text-black text-xl leading mt-8 font-bold">
            Comics available: {character.comics.available}
          </p>
          <p className="text-black text-xl leading-tight font-bold">
            Series available: {character.series.available}
          </p>
          <p className="text-black text-xl leading-tight font-bold">
            Stories available: {character.stories.available}
          </p>
          <p className="text-black text-xl leading-tight font-bold">
            Events available: {character.events.available}
          </p>
        </div>
      </div>
      <HorizontalScrollable
        characterName={character.name}
        comicsImages={distinctComicsImages}
        totalComics={character.comics.items.length}
      />
    </MyContainer>
  );
}
