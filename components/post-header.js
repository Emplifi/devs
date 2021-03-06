import Avatar from "../components/avatar";
import DateFormatter from "../components/date-formatter";
import PostTitle from "../components/post-title";

export default function PostHeader({ title, coverImage, date, author }) {
  return (
    <>
      <div className="mb-8 md:mb-16 sm:mx-0">
        <div
          className="bg-fixed bg-cover bg-clip-text text-transparent my-4 py-4"
          style={{ backgroundImage: "url(" + coverImage + ")" }}
        >
          <PostTitle>
            {title}
          </PostTitle>
        </div>
        <div className="hidden md:block md:mb-4">
          <Avatar name={author.name} picture={author.picture} />
        </div>
        <div className="mb-6 text-lg">
          <DateFormatter dateString={date} />
        </div>
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="block md:hidden mb-6">
          <Avatar name={author.name} picture={author.picture} />
        </div>
      </div>
    </>
  );
}
