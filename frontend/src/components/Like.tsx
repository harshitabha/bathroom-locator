import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import {type Place} from './Map';
import {useEffect, useState} from 'react';
import Chip from '@mui/material/Chip';
import './Like.css';
import {Typography} from '@mui/material';


interface LikeProps {
  bathroom: Place;
  userId: string;
}

/**
 * gets users liked bathrooms
 * @param {string} userId user id
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
 * @param {string} userId user id
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
 * @param {string} userId user id
 * @param {number} bathroomId bathroom id
 */
async function likeBathroom(userId: string, bathroomId: number) {
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

const Like = ({bathroom, userId}: LikeProps) => {
  const [liked, setLiked] = useState(false);
  const [bathroomLikes, setBathroomLikes] = useState(0);

  useEffect(() => {
    /**
     * checks if user has liked the current bathroom
     */
    async function isLiked() {
      const likedBathrooms = await getLikedBathrooms(userId);
      setLiked(likedBathrooms.includes(bathroom.id));
    }

    isLiked();
  }, [userId, bathroom.id]);

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
      <div className='like-button' aria-label='like-button'>
        {liked ?
          <FavoriteIcon color="error"/> :
          <FavoriteBorderIcon/>}
        <Typography color="textSecondary">
          {bathroomLikes > 0 && bathroomLikes}
        </Typography>
      </div>
      {bathroomLikes >= 5 ?
        <Chip label="Verified Bathroom" variant="outlined"
          color="primary"/> :
        null}
    </div>
  );
};

export default Like;
