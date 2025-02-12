"use client";
import { Button } from "@nextui-org/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { Search } from "lucide-react";
import { Key, useEffect, useState } from "react";
import { Card, CardBody } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import { Chip } from "@nextui-org/chip";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSearchParams } from "next/navigation";

import envConfig from "@/src/config/envConfig";
import { IPost } from "@/src/types";
import { useUser } from "@/src/context/user.provider";
import AuthModal from "@/src/components/UI/modal/AuthModal/AuthModal";
import CreatePostModal from "@/src/components/UI/modal/CreatePost/CreatePostModal";

const SortOptions = [
  { key: "date", name: "Date" },
  { key: "upvotes", name: "Most Upvoted" },
  { key: "verification", name: "Verification Score" },
];

const Posts = () => {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || "";

  const [openModal, setOpenModal] = useState(false);
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState(initialCategory || "");
  const [sort, setSort] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterApplied, setFilterApplied] = useState(false);
  const { user } = useUser();
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // Debounce implementation
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchInput);
    }, 900);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  // Check if any filter is applied
  useEffect(() => {
    setFilterApplied(Boolean(searchInput || category || sort));
  }, [searchInput, category, sort]);

  useEffect(() => {
    fetch("https://bdapi.vercel.app/api/v.1/division")
      .then((response) => response.json())
      .then((data) => setDivisions(data.data));
  }, []);

  useEffect(() => {
    if (selectedDivision) {
      fetch(`https://bdapi.vercel.app/api/v.1/district/${selectedDivision}`)
        .then((response) => response.json())
        .then((data) => setDistricts(data.data));
    }
  }, [selectedDivision]);

  const handleCategorySelect = (key: Key) => {
    setCategory(String(key));
  };

  const handleSortSelect = (key: Key) => {
    setSort(String(key));
  };
  console.log(districts, divisions)
  const handleDivisionSelect = (key: Key) => {
    setSelectedDivision(String(key));
    setSelectedDistrict("");
  };

  const handleDistrictSelect = (key: Key) => {
    setSelectedDistrict(String(key));
  };

  return (
    <div className="max-w-7xl relative mx-auto py-5">
      <div className="w-full text-right absolute -top-5 sm:top-5">
        <Button
          className="bg-black text-white dark:bg-white dark:text-black font-medium "
          onClick={() => (user ? setOpenModal(true) : setOpenAuthModal(true))}
        >
          Create A Post
        </Button>
      </div>

      <Card className="my-16">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search posts..."
              startContent={<Search className="text-gray-400" />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <div className="flex gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button className="w-[120px] md:w-[160px] justify-between" variant="bordered">
                    {selectedDivision || "Select Division"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Select division"
                  selectedKeys={selectedDivision ? [selectedDivision] : []}
                  selectionMode="single"
                  onAction={handleDivisionSelect}
                >
                  {divisions.map((division) => (
                    <DropdownItem key={division?.id}>{division.name}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>


              <Dropdown>
                <DropdownTrigger>
                  <Button className="w-[120px] md:w-[160px] justify-between" variant="bordered">
                    {selectedDistrict || "Select District"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Select district"
                  selectedKeys={selectedDistrict ? [selectedDistrict] : []}
                  selectionMode="single"
                  onAction={handleDistrictSelect}
                >
                  {districts.map((district) => (
                    <DropdownItem key={district.id}>{district.name}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>


              <Dropdown>
                <DropdownTrigger>
                  <Button className="w-[120px] md:w-[160px] justify-between" variant="bordered">
                    {SortOptions.find((opt) => opt.key === sort)?.name ||
                      "Sort By"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Sort posts"
                  selectedKeys={sort ? [sort] : []}
                  selectionMode="single"
                  onAction={handleSortSelect}
                >
                  {SortOptions.map((option) => (
                    <DropdownItem key={option.key}>{option.name}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>

          </div>

          {filterApplied && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500">Filters:</span>
              {debouncedSearchTerm && (
                <Chip variant="flat" onClose={() => setSearchInput("")}>
                  Search: {debouncedSearchTerm}
                </Chip>
              )}
              {selectedDivision && (
                <Chip variant="flat" onClose={() => setSelectedDivision("")}>
                  Division: {selectedDivision}
                </Chip>
              )}
              {selectedDistrict && (
                <Chip variant="flat" onClose={() => setSelectedDistrict("")}>
                  District: {selectedDistrict}
                </Chip>
              )}
              {sort && (
                <Chip variant="flat" onClose={() => setSort("")}>
                  Sort: {SortOptions.find((opt) => opt.key === sort)?.name}
                </Chip>
              )}
              <Button
                size="sm"
                variant="light"
                onClick={() => {
                  setSearchInput("");
                  setSelectedDivision("");
                  setSelectedDistrict("");
                  setSort("");
                }}
              >
                Clear All
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
      <div>
        <InfiniteScroll
          dataLength={posts.length}
          endMessage={
            !hasMore && (
              <p style={{ textAlign: "center" }}>
                <b>Yay! You have seen it all</b>
              </p>
            )
          }
          hasMore={hasMore}
          loader={
            hasMore && (
              <div className="grid lg:grid-cols-2 gap-6">
              </div>
            )
          }
          next={() => setPage((prev) => prev + 1)}
        >
          <div className="my-6 grid grid-cols-1 px-1 lg:grid-cols-2 gap-6">
          </div>
        </InfiniteScroll>
      </div>

      {openAuthModal && (
        <AuthModal
          openAuthModal={openAuthModal}
          setOpenAuthModal={setOpenAuthModal}
        />
      )}
      {openModal && (
        <CreatePostModal isOpen={openModal} setIsOpen={setOpenModal} />
      )}
    </div>
  );
};

export default Posts;
