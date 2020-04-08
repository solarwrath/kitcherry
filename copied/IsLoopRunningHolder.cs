using System;

namespace Practice
{
    //Holds flag whether the signal from a dashboard client has been received
    public class IsLoopRunningHolder
    {
        //Synchronized singleton
        private static readonly Lazy<IsLoopRunningHolder> LazyHolder =
            new Lazy<IsLoopRunningHolder>(() => new IsLoopRunningHolder());

        public static IsLoopRunningHolder Instance => LazyHolder.Value;

        public bool LoopRunning { get; set; }

        private IsLoopRunningHolder()
        {
        }
    }
}