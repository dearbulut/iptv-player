import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { ContentItem } from '../store/slices/contentSlice';

interface ContentCardProps {
  item: ContentItem;
  isFavorite?: boolean;
  onFavoriteClick?: () => void;
  onClick?: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({
  item,
  isFavorite = false,
  onFavoriteClick,
  onClick,
}) => {
  return (
    <Card sx={{ position: 'relative' }}>
      <CardActionArea onClick={onClick}>
        <CardMedia
          component="img"
          height="200"
          image={item.poster_url || '/placeholder.jpg'}
          alt={item.title}
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {item.title}
          </Typography>
          {item.category_name && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {item.category_name}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
      {onFavoriteClick && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '50%',
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteClick();
            }}
          >
            {isFavorite ? (
              <Favorite color="error" />
            ) : (
              <FavoriteBorder color="error" />
            )}
          </IconButton>
        </Box>
      )}
    </Card>
  );
};

export default ContentCard;