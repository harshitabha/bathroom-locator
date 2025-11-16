import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import {type Place} from './Map';
import {useState} from 'react';
import {getCurrentUserId} from '../lib/supabaseClient';
import Chip from '@mui/material/Chip';


interface LikeProps {
  bathroom: Place;
}

/**
 * gets users liked bathrooms
 * @param {string | null} userId user id
 * @returns {Array} array of liked bathroom ids
 */
async function getLikedBathrooms(userId: string | null) {
  let bathrooms : Array<number> = [];

  try {
    const res = await fetch(`http://localhost:3000/user/likes?userId=${userId}`);
    if (res.ok) {
      bathrooms = await res.json();
    }
  } catch (error) {
    console.error('Error fetching liked bathrooms: ', error);
  }

  return bathrooms;
}

/**
 * removes the user's like from the bathroom
 * @param {string | null} userId user id
 * @param {number} bathroomId bathroom id
 */
async function unlikeBathroom(userId: string | null, bathroomId: number) {
  try {
    const res = await fetch('http://localhost:3000/user/likes', {
      method: 'delete',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        userId,
        bathroomId,
      }),
    });

    if (res.ok) {
      return;
    }
  } catch (error) {
    console.error('Error deleting like: ', error);
  }

  return;
}

/**
 * adds like to the bathroom
 * @param {string | null} userId user id
 * @param {number} bathroomId bathroom id
 */
async function likeBathroom(userId: string | null, bathroomId: number) {
  try {
    const res = await fetch('http://localhost:3000/user/likes', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        userId,
        bathroomId,
      }),
    });

    if (res.ok) {
      return;
    }
  } catch (error) {
    console.error('Error adding like: ', error);
  }

  return;
}

const Like = ({bathroom} : LikeProps) => {
  const [liked, setLiked] = useState(false);
  const [bathroomLikes, setBathroomLikes] = useState(0);
  const [userId, setUserId] = useState<string | null>('');

  /**
   * get user id from supabase and checks if user has liked the current bathroom
   * @returns {string | null} user id
   */
  async function isLiked() {
    if (!userId) {
      setUserId(await getCurrentUserId());
    }
    if (userId) {
      // get users liked bathrooms
      const likedBathrooms = await getLikedBathrooms(userId);

      setLiked(likedBathrooms.includes(bathroom.id));
    }
  }

  isLiked();

  const handleToggle = async () => {
    // update likes table
    if (liked) {
      await unlikeBathroom(userId, bathroom.id);
      setLiked(false);
      setBathroomLikes(bathroomLikes - 1);
    } else {
      await likeBathroom(userId, bathroom.id);
      setLiked(true);
      setBathroomLikes(bathroomLikes + 1);
    }
  };

  return (
    <div onClick = {handleToggle}>
      {/* if not liked, favorite border icon, else favorite */}
      {liked ? <FavoriteIcon/> : <FavoriteBorderIcon/>}
      {bathroomLikes > 0 && bathroomLikes}
      {bathroomLikes >= 5 ?
        <Chip label="Verified Bathroom" variant="outlined" /> : null}
    </div>
  );
};

export default Like;
