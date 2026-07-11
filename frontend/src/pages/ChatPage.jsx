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

  return (
    <div className="h-screen w-screen p-3 sm:p-4">
      <BorderAnimatedContainer>
        <div className="flex h-full w-full overflow-hidden rounded-[28px]">
          {/* Sidebar */}
          <aside
            className="
              flex
              w-80
              shrink-0
              flex-col

              border-r
              border-white/10

              bg-white/[0.035]
              backdrop-blur-3xl
            "
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
            className="
              relative
              flex
              min-w-0
              flex-1
              flex-col
              bg-white/[0.02]
              backdrop-blur-3xl
            "
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/8 blur-[160px]" />
            </div>

            <div className="relative flex h-full flex-1">
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
