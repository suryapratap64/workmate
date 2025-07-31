import React from "react";
import { IoHelp } from "react-icons/io5";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
import { IoNotificationsOutline } from "react-icons/io5";
import {useTheme} from "../components/ThemeProvider"
import { Link } from "react-router-dom";
const NavBar = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <>
     <div className="flex  items-center justify-between   bg-white px-4 py-2 shadow-md w-full">
      {/* Logo */}
      <div className="flex flex-row   items-center">
      <div className="text-xl font-bold text-white bg-yellow-600 px-3 py-1 rounded-lg">
        WORKMATE
      </div>

      {/* Navigation Links */}
      <nav className=" ml-15 gap-x-5 flex space-x-7 ">
        <a href="#" className="text-black font-serif hover:text-green-600 border-b-2 hover:border-b-green-400">
          Find work
        </a>
       
        
        <a href="/message" className="text-black font-serif hover:text-green-600 border-b-2 hover:border-b-green-400 ">
         Messages
        </a>
        <a href="#" className="text-black font-serif hover:text-green-600 border-b-2 hover:border-b-green-400">
          Services
        </a>
        <a href="#" className="text-black font-serif hover:text-green-600 border-b-2 hover:border-b-green-400">
          Contact
        </a>
      </nav>
      </div>
    

      {/* Search Box */}
      <div className="justify-end flex ">

      <div className="flex items-center border  border-black rounded-lg px-2">
        <input
          type="text"
          placeholder="Search jobs..."
          className="outline-none text-black px-2 py-1 w-40 md:w-60"
        />
        <span className="text-black ml-2">jobs</span>
      </div>

      {/* Help Icon */}
      <div className="text-2xl flex gap-5  mt-2  text-black ml-4">
        <IoHelp />
        <IoNotificationsOutline />
       
      </div>

      {/* User Avatar */}
    
     
      <Dialog>
        <DialogTrigger asChild>
        <div className="w-10 h-10 rounded-full justify-items-end overflow-hidden border-2 border-gray-300 ml-4 cursor-pointer">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSe4fD5tnoKgCRVJo-CZLuiWYicy5Z3_qxXog&s"
          alt="User Avatar"
          className="w-full h-full object-cover"
        />
      </div>

        </DialogTrigger>
       
        <DialogContent className="w-60 rounded-sm flex flex-col bg-gray-300 mt-8 absolute shadow-lg p-3">
        <Link to="/profile">
        <div className="text-center w-full hover:border-1 rounded-lg border-green-800 text-xl gap-2 p-2">
            Profile
          </div>
        </Link>
          <div
              onClick={toggleTheme}
              className="text-center w-full hover:border-1  border-green-800 rounded-lg text-xl gap-2 p-2 dark:text-white cursor-pointer "
            >
              Theme: {theme === "light" ? "Light" : "Dark"}
            </div>

           <Button variant="destructive" className="text-center w-full hover:border-1 rounded-lg border-green-800 text-xl gap-2 p-2">
              Logout
           </Button>
      
        </DialogContent>
     




      </Dialog>

 
      </div>
      

    </div>
    </>
  );
};

export default NavBar;
