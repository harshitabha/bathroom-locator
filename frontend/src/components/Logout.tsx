import {supabase} from '../lib/supabaseClient';

type LogoutProps = {
    setUserId: React.Dispatch<React.SetStateAction<string | null>>
}

const Logout = ({setUserId} : LogoutProps) => {
  /**
   * signs out current user
   */
  async function signOutUser() {
    const {error} = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      setUserId(null);
    }
  }

  return (
    <div onClick={signOutUser}>
        Logout
    </div>
  );
};

export default Logout;
