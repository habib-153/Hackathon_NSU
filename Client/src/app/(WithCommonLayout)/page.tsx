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
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import { Chip } from "@nextui-org/chip";
import { Avatar } from "@nextui-org/avatar";
import { ChevronUp, ChevronDown, MessageSquare, Flag } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSearchParams } from "next/navigation";
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { useUser } from "@/src/context/user.provider";
import AuthModal from "@/src/components/UI/modal/AuthModal/AuthModal";
import CreatePostModal from "@/src/components/UI/modal/CreatePost/CreatePostModal";
import { useGetAllPosts } from "@/src/hooks/post.hook";

// Types
interface IAuthor {
  _id: string;
  name: string;
  avatar: string;
}

interface IDistrict {
  id: string;
  name: string;
}

interface IPost {
  _id: string;
  title: string;
  description: string;
  image: string;
  author: IAuthor;
  district: IDistrict;
  division: string;
  location: string;
  upVotes: string[];
  downVotes: string[];
  isDeleted: boolean;
  postDate: Date;
  crimeDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const SortOptions = [
  { key: "date", name: "Date" },
  { key: "upvotes", name: "Most Upvoted" },
  { key: "verification", name: "Verification Score" },
];

const PostCard = ({ post, onVote, userId }: { post: IPost; onVote: (postId: string, voteType: 'up' | 'down') => Promise<void>; userId?: string }) => {
  const [isVoting, setIsVoting] = useState(false);
  const isUpvoted = post.upVotes.includes(userId || '');
  const isDownvoted = post.downVotes.includes(userId || '');
  const voteCount = post.upVotes.length - post.downVotes.length;

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!userId) {
      toast.error('Please login to vote');

      return;
    }
    if (isVoting) return;

    try {
      setIsVoting(true);
      await onVote(post._id, voteType);
    } catch (error) {
      toast.error('Failed to vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardBody className="gap-4">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <Button
              isIconOnly
              className={isUpvoted ? "text-blue-500" : ""}
              isDisabled={isVoting}
              variant="light"
              onClick={() => handleVote('up')}
            >
              <ChevronUp size={24} />
            </Button>
            <span className="font-bold">{voteCount}</span>
            <Button
              isIconOnly
              className={isDownvoted ? "text-red-500" : ""}
              isDisabled={isVoting}
              variant="light"
              onClick={() => handleVote('down')}
            >
              <ChevronDown size={24} />
            </Button>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Avatar size="sm" src={post.author.avatar} />
              <span className="text-sm text-default-500">
                Posted by {post.author.name} • {format(new Date(post.postDate), 'MMM d, yyyy')}
              </span>
            </div>

            <h3 className="text-lg font-bold mb-2">{post.title}</h3>

            {post.image && (
              <img
                alt={post.title}
                className="w-full h-48 object-cover rounded-lg mb-2"
                src={post.image}
              />
            )}

            <p className="text-default-600 mb-2">{post.description}</p>

            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-sm text-default-500">
                📍 {post.district.name}, {post.division}
              </span>
              <span className="text-sm text-default-500">
                🕒 Crime Date: {format(new Date(post.crimeDate), 'MMM d, yyyy')}
              </span>
            </div>

            <div className="flex gap-4">
              <Button
                startContent={<MessageSquare size={18} />}
                variant="light"
              >
                Comments
              </Button>
              <Button
                className="text-danger"
                startContent={<Flag size={18} />}
                variant="light"
              >
                Report
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const Posts = () => {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [openModal, setOpenModal] = useState(false);
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterApplied, setFilterApplied] = useState(false);
  const { user } = useUser();
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([
    {
      _id: '1',
      title: 'Suspicious activity reported near City Park',
      description: 'Multiple residents have reported seeing suspicious individuals lurking around City Park during late hours. Local authorities have been notified and increased patrols in the area.',
      image: '/api/placeholder/800/400',
      author: {
        _id: '1',
        name: 'John Doe',
        avatar: '/api/placeholder/40/40',
        isDeleted: false,
      },
      district: { name: 'Central District' },
      division: 'Metropolitan',
      location: 'City Park Area',
      upVotes: Array(125),
      downVotes: Array(12),
      postDate: new Date(),
      crimeDate: new Date('2024-02-10'),
      isDeleted: false,
    },
    {
      _id: '2',
      title: 'Vehicle theft prevention warning',
      description: 'Recent increase in vehicle thefts in the downtown area. Please ensure your vehicles are properly secured and valuables are not left visible. Several incidents have been reported in the past week.',
      image: '/api/placeholder/800/400',
      author: {
        _id: '2',
        name: 'Jane Smith',
        avatar: '/api/placeholder/40/40'
      },
      district: { name: 'Downtown' },
      division: 'Metropolitan',
      location: 'Downtown Area',
      upVotes: Array(89),
      downVotes: Array(5),
      postDate: new Date('2024-02-11'),
      crimeDate: new Date('2024-02-09'),
      isDeleted: false,
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>(
    []
  );
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(selectedDivision && { division: selectedDivision }),
        ...(selectedDistrict && { district: selectedDistrict }),
        ...(sort && { sort }),
      });

      const response = await fetch(`/api/posts?${params}`);
      const data = await response.json();

      if (page === 1) {
        setPosts(data.posts);
        console.log(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }

      setHasMore(data.hasMore);
    } catch (error) {
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };
  const mockPosts = [
    {
      _id: '1',
      title: 'Suspicious activity reported near City Park',
      description: 'Multiple residents have reported seeing suspicious individuals lurking around City Park during late hours. Local authorities have been notified and increased patrols in the area.',
      image: '/api/placeholder/800/400',
      author: {
        _id: '1',
        name: 'John Doe',
        avatar: '/api/placeholder/40/40',
        isDeleted: false,
      },
      district: { name: 'Central District' },
      division: 'Metropolitan',
      location: 'City Park Area',
      upVotes: Array(125),
      downVotes: Array(12),
      postDate: new Date(),
      crimeDate: new Date('2024-02-10'),
    },
    {
      _id: '2',
      title: 'Vehicle theft prevention warning',
      description: 'Recent increase in vehicle thefts in the downtown area. Please ensure your vehicles are properly secured and valuables are not left visible. Several incidents have been reported in the past week.',
      image: '/api/placeholder/800/400',
      author: {
        _id: '2',
        name: 'Jane Smith',
        avatar: '/api/placeholder/40/40'
      },
      district: { name: 'Downtown' },
      division: 'Metropolitan',
      location: 'Downtown Area',
      upVotes: Array(89),
      downVotes: Array(5),
      postDate: new Date('2024-02-11'),
      crimeDate: new Date('2024-02-09'),
    }
  ];

  // Handle voting
  const handleVote = async (postId: string, voteType: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType }),
      });

      if (!response.ok) throw new Error('Vote failed');

      const updatedPost = await response.json();

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? { ...post, ...updatedPost } : post
        )
      );
    } catch (error) {
      throw error;
    }
  };

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchInput);
      setPage(1); // Reset page when search changes
    }, 900);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  // Check filters
  useEffect(() => {
    setFilterApplied(Boolean(searchInput || category || sort || selectedDivision || selectedDistrict));
  }, [searchInput, category, sort, selectedDivision, selectedDistrict]);

  // Fetch posts when filters change
  useEffect(() => {
    fetchPosts();
  }, [debouncedSearchTerm, selectedDivision, selectedDistrict, sort, page]);

  // Fetch divisions
  useEffect(() => {
    fetch("https://bdapi.vercel.app/api/v.1/division")
      .then((response) => response.json())
      .then((data) => setDivisions(data.data));
  }, []);

  // Fetch districts
  useEffect(() => {
    if (selectedDivision) {
      fetch(`https://bdapi.vercel.app/api/v.1/district/${selectedDivision}`)
        .then((response) => response.json())
        .then((data) => setDistricts(data.data));
    }
  }, [selectedDivision]);

  const handleCategorySelect = (key: Key) => {
    setCategory(String(key));
    setPage(1);
  };

  const handleSortSelect = (key: Key) => {
    setSort(String(key));
    setPage(1);
  };

  const handleDivisionSelect = (key: Key) => {
    setSelectedDivision(String(key));
    setSelectedDistrict("");
    setPage(1);
  };

  const handleDistrictSelect = (key: Key) => {
    setSelectedDistrict(String(key));
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSelectedDivision("");
    setSelectedDistrict("");
    setSort("");
    setCategory("");
    setPage(1);
  };

  const apiUrl = `${envConfig.baseApi}/posts?${new URLSearchParams({
    ...(debouncedSearchTerm && { searchTerm: debouncedSearchTerm }),
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

  console.log(postData);

  return (
    <div className="max-w-7xl relative mx-auto py-5">
      <div className="w-full text-right absolute -top-5 sm:top-5">
        <Button
          className="bg-black text-white dark:bg-white dark:text-black font-medium"
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
                  <Button
                    className="w-[120px] md:w-[160px] justify-between"
                    variant="bordered"
                  >
                    {divisions.find((div) => div.id === selectedDivision)
                      ?.name || "Select Division"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Select division"
                  selectedKeys={selectedDivision ? [selectedDivision] : []}
                  selectionMode="single"
                  onAction={handleDivisionSelect}
                >
                  {divisions.map((division) => (
                    <DropdownItem key={division?.id}>
                      {division.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>

              <Dropdown>
                <DropdownTrigger>
                  <Button
                    className="w-[120px] md:w-[160px] justify-between"
                    variant="bordered"
                  >
                    {districts.find((dist) => dist.id === selectedDistrict)
                      ?.name || "Select District"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Select district"
                  selectedKeys={selectedDistrict ? [selectedDistrict] : []}
                  selectionMode="single"
                  onAction={handleDistrictSelect}
                >
                  {districts.map((district) => (
                    <DropdownItem key={district.id}>
                      {district.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>

              <Dropdown>
                <DropdownTrigger>
                  <Button
                    className="w-[120px] md:w-[160px] justify-between"
                    variant="bordered"
                  >
                    {SortOptions.find((opt) => opt.key === sort)?.name || "Sort By"}
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
                  Division: {divisions.find(div => div.id === selectedDivision)?.name}
                </Chip>
              )}
              {selectedDistrict && (
                <Chip variant="flat" onClose={() => setSelectedDistrict("")}>
                  District: {districts.find(dist => dist.id === selectedDistrict)?.name}
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
                onClick={clearFilters}
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
            !hasMore && posts.length > 0 && (
              <p className="text-center my-8 text-gray-500">
                You've reached the end! No more posts to load.
              </p>
            )
          }
          hasMore={hasMore}
          loader={hasMore && <div className="grid lg:grid-cols-2 gap-6"></div>}
          next={() => setPage((prev) => prev + 1)}
        >
          <div className="my-6 grid grid-cols-1 px-1 lg:grid-cols-2 gap-6"></div>
        </InfiniteScroll>

        {loading && posts.length === 0 && (
          <div className="grid lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <Card key={n} className="w-full">
                <CardBody>
                  <div className="animate-pulse flex gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 bg-gray-200 rounded">f</div>
                      <div className="h-4 w-4 bg-gray-200 rounded">g</div>
                      <div className="h-8 w-8 bg-gray-200 rounded">h</div>
                    </div>
                    <div className="flex-1">
                      <div className="h-4 w-1/4 bg-gray-200 rounded mb-4">e</div>
                      <div className="h-6 w-3/4 bg-gray-200 rounded mb-4">c</div>
                      <div className="h-32 bg-gray-200 rounded mb-4">d</div>
                      <div className="h-4 w-full bg-gray-200 rounded mb-2">h</div>
                      <div className="h-4 w-2/3 bg-gray-200 rounded mb-4">k</div>
                      <div className="flex gap-2">
                        <div className="h-8 w-24 bg-gray-200 rounded">s</div>
                        <div className="h-8 w-24 bg-gray-200 rounded"><map name=""></map></div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <Card className="w-full my-8">
            <CardBody>
              <div className="text-center py-8">
                <p className="text-xl font-semibold mb-2">No posts found</p>
                <p className="text-gray-500">
                  {filterApplied
                    ? "Try adjusting your filters or search terms"
                    : "Be the first to create a post!"
                  }
                </p>
              </div>
            </CardBody>
          </Card>
        )}
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