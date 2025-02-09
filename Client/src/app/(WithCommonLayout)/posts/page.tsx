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

import PostCard from "@/src/components/UI/PostCard";
import envConfig from "@/src/config/envConfig";
import { useGetAllPosts } from "@/src/hooks/post.hook";
import { IPost } from "@/src/types";
import { useUser } from "@/src/context/user.provider";
import AuthModal from "@/src/components/UI/modal/AuthModal/AuthModal";
import CreatePostModal from "@/src/components/UI/modal/PostModals/CreatePostModal";
import PostCardSkeleton from "@/src/components/UI/PostCardSkeleton";

const Categories = [
  "Adventure",
  "Exploration",
  "Business Travel",
  "Family Vacation",
  "Relaxation",
  "Luxury Travel",
];

const SortOptions = [
  { key: "upvotes", name: "Most Upvoted" },
  { key: "downvotes", name: "Most Downvoted" },
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

  const handleCategorySelect = (key: Key) => {
    setCategory(String(key));
  };

  const handleSortSelect = (key: Key) => {
    setSort(String(key));
  };

  const apiUrl = `${envConfig.baseApi}/posts?${new URLSearchParams({
    ...(debouncedSearchTerm && { searchTerm: debouncedSearchTerm }),
    ...(category && { category }),
    ...(sort && { sort }),
    page: page.toString(),
  }).toString()}`;

  const { data: postData } = useGetAllPosts(apiUrl);

  useEffect(() => {
    if (postData?.data) {
      if (page === 1) {
        setPosts(postData?.data);
      } else {
        setPosts((prev) => [...prev, ...postData?.data]);
      }
      setHasMore(postData?.data?.length === 10);
    }
  }, [postData, page]);

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
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Travel Posts</h1>
        <p className="">Discover and share travel experiences</p>
      </div>

      <Card className="mb-8">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search posts..."
              startContent={<Search className="text-gray-400" />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />

            <Dropdown>
              <DropdownTrigger>
                <Button className="w-full justify-between" variant="bordered">
                  {category || "Select Category"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Select category"
                selectedKeys={category ? [category] : []}
                selectionMode="single"
                onAction={handleCategorySelect}
              >
                {Categories.map((cat) => (
                  <DropdownItem key={cat}>{cat}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger>
                <Button className="w-full justify-between" variant="bordered">
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

          {filterApplied && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500">Filters:</span>
              {debouncedSearchTerm && (
                <Chip variant="flat" onClose={() => setSearchInput("")}>
                  Search: {debouncedSearchTerm}
                </Chip>
              )}
              {category && (
                <Chip variant="flat" onClose={() => setCategory("")}>
                  Category: {category}
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
                  setCategory("");
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
                <PostCardSkeleton />
                <PostCardSkeleton />
              </div>
            )
          }
          next={() => setPage((prev) => prev + 1)}
        >
          <div className="my-6 grid grid-cols-1 px-1 lg:grid-cols-2 gap-6">
            {posts
              ? posts?.map((post: IPost, index: number) => (
                  <PostCard key={index} full={false} post={post} />
                ))
              : Array.from({ length: 2 }).map((_, index) => (
                  <PostCardSkeleton key={index} />
                ))}
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
