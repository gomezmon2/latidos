import { createBrowserRouter } from "react-router-dom";
import { AppWrapper } from "@/components/AppWrapper";
import Index from "@/pages/Index";
import Explore from "@/pages/Explore";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import CreateExperience from "@/pages/CreateExperience";
import EditExperience from "@/pages/EditExperience";
import ExperienceDetail from "@/pages/ExperienceDetail";
import Favorites from "@/pages/Favorites";
import Compartidos from "@/pages/Compartidos";
import MyStories from "@/pages/MyStories";
import Circles from "@/pages/Circles";
import Chats from "@/pages/Chats";
import ChatWindow from "@/pages/ChatWindow";
import Guides from "@/pages/Guides";
import Mission from "@/pages/Mission";
import Privacy from "@/pages/Privacy";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";

/**
 * Application routes configuration
 * Centralized routing using React Router v6
 */
export const router = createBrowserRouter([
  {
    element: <AppWrapper />,
    errorElement: <NotFound />,
    children: [
      {
        path: "/",
        element: <Index />,
      },
      {
        path: "/explore",
        element: <Explore />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/create",
        element: <CreateExperience />,
      },
      {
        path: "/experience/:id",
        element: <ExperienceDetail />,
      },
      {
        path: "/experience/:id/edit",
        element: <EditExperience />,
      },
      {
        path: "/favorites",
        element: <Favorites />,
      },
      {
        path: "/compartidos",
        element: <Compartidos />,
      },
      {
        path: "/my-stories",
        element: <MyStories />,
      },
      {
        path: "/circles",
        element: <Circles />,
      },
      {
        path: "/chat",
        element: <Chats />,
      },
      {
        path: "/chat/:id",
        element: <ChatWindow />,
      },
      {
        path: "/guides",
        element: <Guides />,
      },
      {
        path: "/mission",
        element: <Mission />,
      },
      {
        path: "/privacy",
        element: <Privacy />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

/**
 * Route paths constants
 * Use these for navigation instead of hardcoded strings
 */
export const ROUTES = {
  HOME: "/",
  EXPLORE: "/explore",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  CREATE: "/create",
  EXPERIENCE: "/experience",
  FAVORITES: "/favorites",
  COMPARTIDOS: "/compartidos",
  MY_STORIES: "/my-stories",
  CIRCLES: "/circles",
  CHAT: "/chat",
  CREATE_EXPERIENCE: "/create",
  GUIDES: "/guides",
  MISSION: "/mission",
  PRIVACY: "/privacy",
  CONTACT: "/contact",
  NOT_FOUND: "*",
} as const;
