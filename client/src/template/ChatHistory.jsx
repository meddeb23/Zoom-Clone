import axios from "axios";
import React, { useContext, useState, useEffect } from "react";
import { ChatCard } from "../components";
import { ChatContext, UserContext } from "../context";

export function ChatHistory() {
  const { setChat, setChatList, setReceiver, chatList } = useContext(
    ChatContext
  );
  const { user } = useContext(UserContext);
  const [search, setSearch] = useState("");
  const [searchBox, setSearchbox] = useState(false);

  const [resualt, setResulat] = useState([]);
  const [userSeggestions, setUserSuggestion] = useState([]);
  // const limit = 10;
  // const [offset, setOffset] = useState(0);

  const onLoadChatHistory = async () => {
    const limit = 10;
    const offset = 1;
    try {
      const res = await axios.get(
        `/api/v1/chat?limit=${limit}&offset=${offset}`
      );
      if (res.status === 200) {
        setChatList(res.data);
        // set the first chat as active chat
        if (res.data.length !== 0 && window.innerWidth >= 768) {
          onLoadChatById(res.data[0]._id);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const onLoadUserSeggestions = async () => {
    try {
      const res = await axios.get(`/api/v1/user/suggestion`);
      if (res.status === 200) {
        setUserSuggestion(res.data.users);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/v1/user/search", { search });
      if (res.status === 200) {
        setResulat(res.data.users);
      }
    } catch (error) {
      console.log(error.response);
    }
  };
  const onLoadChatByUser = async (_id) => {
    try {
      const res = await axios.get(`/api/v1/chat/receiver/${_id}`);
      if (res.status === 200) {
        setChat(res.data);
        setResulat([]);
      }
      setResulat([]);
    } catch (error) {
      console.log(error.response);
    }
  };
  const onLoadChatById = async (_id) => {
    const limit = 10;
    const offset = 0;
    try {
      const res = await axios.get(
        `/api/v1/chat/${_id}?limit=${limit}&offset=${offset}`
      );
      if (res.status === 200) {
        setChat(res.data);
        setReceiver(res.data.receiver);
        setResulat([]);
      }
      setResulat([]);
    } catch (error) {
      console.log(error.response);
    }
  };

  useEffect(() => {
    onLoadChatHistory();
    onLoadUserSeggestions();
  }, []);

  return (
    <>
      {searchBox && (
        <div
          className="absolute top-0 left-0 z-40 h-full w-full"
          style={{ background: "#00000033" }}
          onClick={() => setSearchbox(false)}
        ></div>
      )}
      <div
        className="mt-8 md:mt-0 w-full md:w-72 h-full overflow-auto flex-none"
        style={{ height: "calc(100vh - 2rem)" }}
      >
        <div className="relative mx-2 z-40">
          <form
            onSubmit={(e) => onSearch(e)}
            className="flex flex-row items-center bg-white border-2 border-gray-200 py-2 px-3  rounded-md"
          >
            <button type="submit" className="cursor-pointer">
              <svg
                className="w-5 flex-none text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none ml-2 text-sm w-full"
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchbox(true)}
            />
          </form>
          {resualt.length !== 0 && (
            <ul
              className=" bg-white border-2 border-gray-200  rounded-md shadow-lg absolute w-full mt-1 overflow-y-auto"
              style={{ maxHeight: "200px" }}
            >
              {resualt.map((item) => (
                <li
                  key={`search_user_${item._id}`}
                  className="cursor-pointer hover:bg-gray-100 py-2 px-3 "
                  onClick={() => {
                    setSearchbox(false);
                    onLoadChatByUser(item._id);
                  }}
                >
                  <div className="text-gray-600">{item.name}</div>
                  <div className="text-sm text-gray-400">{item.email}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <section className="pl-2 pt-4">
          <div className="flex flex-row items-center mb-4 space-x-3">
            <h2 className="font-bold text-3xl">Inbox</h2>
            <div className="text-xs border text-red-400 border-red-400 bg-red-100 rounded-full px-2 py-1 font-bold">
              4 new
            </div>
          </div>
          {user && <div className="m-4">{user.name}</div>}
          <div>
            {chatList.length !== 0 &&
              chatList.map((item) => (
                <ChatCard
                  key={item._id}
                  data={item}
                  loadChat={onLoadChatById}
                  user={user}
                />
              ))}
          </div>
          {userSeggestions.length !== 0 && (
            <div>
              <h1 className="font-bold mb-4 text-gray-900 text-sm pb-1 border-b-2 border-gray-600">
                suggestions
              </h1>
              {userSeggestions.map((item) => (
                <div
                  onClick={() => onLoadChatByUser(item._id)}
                  className="flex flex-row items-center cursor-pointer hover:bg-gray-200 p-2 transition-colors space-x-2 my-1"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={item.profile_img}
                      alt={`${item.name} profile picture`}
                      className="w-8 h-8 object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-gray-600">{item.name}</div>
                    <div className="text-sm text-gray-400">{item.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
