import ActiveTabSwitch from "../components/ActiveTabSwitch";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ChatContainer from "../components/ChatContainer";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import ProfileHeader from "../components/ProfileHeader";
import { useChatStore } from "../store/useChatStore";
const ChatPage = () => {
  const { activeTab, selectedUsers } = useChatStore();
  const showSidebar = !selectedUsers;
  const showChat = Boolean(selectedUsers);

  return (
    <div className="h-dvh w-screen overflow-hidden p-0 sm:h-screen sm:p-3 lg:p-4">
      <BorderAnimatedContainer>
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[28px] lg:flex-row">
          {/* Sidebar */}
          <aside
            className={`
              w-full
              min-h-0
              shrink-0
              flex-col
              lg:w-80

              border-r
              border-white/10

              bg-white/[0.035]
              backdrop-blur-3xl

              ${showSidebar ? "flex" : "hidden lg:flex"}
            `}
          >
            <ProfileHeader />

            <div className="px-4 pt-3">
              <ActiveTabSwitch />
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
              {activeTab === "chats" ? <ChatsList /> : <ContactList />}
            </div>
          </aside>

          {/* Chat */}
          <main
            className={`
              relative
              min-h-0
              min-w-0
              flex-1
              flex-col
              bg-white/[0.02]
              backdrop-blur-3xl

              ${showChat ? "flex" : "hidden lg:flex"}
            `}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/8 blur-[160px]" />
            </div>

            <div className="relative flex h-full min-h-0 flex-1">
              {selectedUsers ? (
                <ChatContainer />
              ) : (
                <NoConversationPlaceholder />
              )}
            </div>
          </main>
        </div>
      </BorderAnimatedContainer>
    </div>
  );
};

export default ChatPage;
