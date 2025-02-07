import { FunctionalSection } from "./FunctionalSection";
import { useEffect, useState } from "react";
import { ActiveComponent, Dog } from "../types";
import { FunctionalDogs } from "./FunctionalDogs";
import { FunctionalCreateDogForm } from "./FunctionalCreateDogForm";
import { Requests } from "../api";
import toast from "react-hot-toast";

export function FunctionalApp() {
  const [allDogs, setAllDogs] = useState<Dog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeComponent, setActiveComponent] =
    useState<ActiveComponent>("all");

  const refetchDogData = () => {
    return Requests.getAllDogs().then(setAllDogs);
  };

  useEffect(() => {
    refetchDogData().catch(() => {
      throw new Error("Unable to fetch data");
    });
  }, []);

  const postDog = async (dog: Omit<Dog, "id">) => {
    setIsLoading(true);

    try {
      await Requests.postDog(dog);
      await refetchDogData();
      toast.success(`Created ${dog.name}`);
      return;
    } catch {
      toast.error(`Unable to create ${dog.name}`);

      throw new Error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDog = async (dog: Dog) => {
    setIsLoading(true);
    try {
      await Requests.deleteDog(dog);
      await refetchDogData();
      toast.success(`Deleted ${dog.name}`);
    } catch {
      toast.error(`Unable to delete ${dog.name}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDog = async (dog: Dog, isFavorite: boolean) => {
    setIsLoading(true);
    const isFavValue = isFavorite ? "Favorited" : "Unfavorited";
    try {
      await Requests.updateDog(dog, isFavorite);
      await refetchDogData();
      toast.success(`${isFavValue} ${dog.name}`);
    } catch {
      toast.error(`Unable to ${isFavValue} ${dog.name}`);
    } finally {
      setIsLoading(false);
    }
  };
  const determineActiveComponent = (component: ActiveComponent) => {
    const newActiveValue = component === activeComponent ? "all" : component;
    setActiveComponent(newActiveValue);
  };

  const shouldShowForm = activeComponent === "create-dog-form";

  const favoritedDogs = Object.values(allDogs).filter((dog) => dog.isFavorite);
  const unfavoritedDogs = Object.values(allDogs).filter(
    (dog) => !dog.isFavorite
  );

  const determineDogArray = (): Dog[] => {
    switch (activeComponent) {
      case "all":
        return allDogs;
      case "favorited":
        return favoritedDogs;
      case "unfavorited":
        return unfavoritedDogs;
      case "create-dog-form":
        return [];
    }
  };
  const dogArray = determineDogArray();

  return (
    <div className="App" style={{ backgroundColor: "skyblue" }}>
      <header>
        <h1>pup-e-picker (Functional)</h1>
      </header>
      <FunctionalSection
        determineActiveComponent={determineActiveComponent}
        activeComponent={activeComponent}
        favoritedDogsCount={favoritedDogs.length}
        unfavoritedDogsCount={unfavoritedDogs.length}
      >
        {shouldShowForm ? (
          <FunctionalCreateDogForm postDog={postDog} isLoading={isLoading} />
        ) : (
          <FunctionalDogs
            dogs={dogArray}
            deleteDog={deleteDog}
            updateDog={updateDog}
            isLoading={isLoading}
          />
        )}
      </FunctionalSection>
    </div>
  );
}
